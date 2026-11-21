import "dotenv/config";
import express from "express";
import path from "path";
import os from "os";
import crypto from "crypto";
import fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { GoogleGenAI, Modality, ThinkingLevel, Type } from "@google/genai";
import {
  ALLOWED_RECITER_IDS,
  getReciterById,
  normalizeArabic,
  parseQuranReference,
} from "./src/utils/quranData.ts";
import {
  CITATION_TYPE_LABELS,
  CitationType,
  SupportingCitation,
  getCategoryEditorialProfile,
} from "./src/utils/categoryEditorial.ts";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ALLOWED_TTS_VOICES = new Set(["Kore", "Charon", "Fenrir", "Puck", "Zephyr"]);
const ALLOWED_VIDEO_MIMES = new Set(["audio/wav", "audio/mpeg", "audio/mp3", "audio/webm"]);
const ALLOWED_MOTION_STYLES = new Set(["kenburns", "gentle", "static"]);

const isAllowedIslamicAudioUrl = (rawUrl: string): boolean => {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "cdn.islamic.network" &&
      parsed.pathname.startsWith("/quran/audio/")
    );
  } catch {
    return false;
  }
};

const ensureSafeWorkFile = (workDir: string, fileName: string): string => {
  const base = path.resolve(workDir);
  const resolved = path.resolve(base, fileName);
  if (!resolved.startsWith(base + path.sep)) {
    throw new Error("Invalid temporary file path");
  }
  return resolved;
};

const createGenAiClient = (apiKey: string, apiVersion?: string) =>
  new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

const hashKeyForScope = (rawKey: string): string =>
  crypto.createHash("sha256").update(rawKey).digest("hex").slice(0, 12);

const parseUserGeminiKeys = (req: express.Request): { userKeys: string[]; allowServerFallback: boolean } => {
  const rawHeader = req.header("X-User-Gemini-Keys") || "";
  const fallbackHeader = req.header("X-User-Key-Fallback");
  const allowServerFallback = fallbackHeader !== "0";

  if (!rawHeader || rawHeader.length > 8192) {
    return { userKeys: [], allowServerFallback: true };
  }

  try {
    const decoded = Buffer.from(rawHeader, "base64").toString("utf8");
    const parsed = JSON.parse(decoded);
    if (!Array.isArray(parsed)) {
      return { userKeys: [], allowServerFallback };
    }
    const seen = new Set<string>();
    const validKeys: string[] = [];
    for (const item of parsed) {
      if (validKeys.length >= 15) break;
      if (typeof item !== "string") continue;
      const trimmed = item.trim();
      if (trimmed.length < 20 || trimmed.length > 200 || /\s/.test(trimmed) || !/^[\x21-\x7E]+$/.test(trimmed)) {
        continue;
      }
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
      validKeys.push(trimmed);
    }
    return { userKeys: validKeys, allowServerFallback };
  } catch {
    return { userKeys: [], allowServerFallback: true };
  }
};

const isInvalidKeyError = (error: unknown): boolean => {
  if (!error) return false;
  const err = error as Record<string, unknown>;
  const msg = `${String(err?.message || "")} ${String(err?.status || "")}`;
  return (
    msg.includes("API_KEY_INVALID") ||
    msg.includes("API key not valid") ||
    msg.includes("401") ||
    msg.includes("UNAUTHENTICATED")
  );
};

// Track temporary server-side cooldowns by hashed key+scope (raw keys are never stored or logged)
const keyScopeCooldownUntil = new Map<string, number>();

async function executeWithSmartKeyRotation<T>(
  req: express.Request,
  res: express.Response,
  options: { scope: string; apiVersion?: string },
  runner: (client: GoogleGenAI, keyHash: string) => Promise<T>
): Promise<T> {
  const { userKeys, allowServerFallback } = parseUserGeminiKeys(req);
  const serverKey = (process.env.GEMINI_API_KEY || "").trim();

  type Candidate = { apiKey: string; userIdx: number; keyHash: string };
  const candidates: Candidate[] = userKeys.map((apiKey, idx) => ({
    apiKey,
    userIdx: idx,
    keyHash: hashKeyForScope(apiKey),
  }));

  if (serverKey && (allowServerFallback || candidates.length === 0)) {
    const serverHash = hashKeyForScope(serverKey);
    if (!candidates.some((c) => c.keyHash === serverHash)) {
      candidates.push({ apiKey: serverKey, userIdx: -1, keyHash: serverHash });
    }
  }

  if (candidates.length === 0) {
    throw new Error("لا يوجد مفتاح ذكاء اصطناعي متاح. أضف مفتاحاً من الإعدادات أو فعّل المفتاح الاحتياطي.");
  }

  const now = Date.now();
  const healthy = candidates.filter((c) => (keyScopeCooldownUntil.get(`${options.scope}:${c.keyHash}`) || 0) <= now);
  const cooled = candidates.filter((c) => (keyScopeCooldownUntil.get(`${options.scope}:${c.keyHash}`) || 0) > now);
  const orderedCandidates = healthy.length > 0 ? [...healthy, ...cooled] : candidates;

  const cooledUserIndices: number[] = [];
  const invalidUserIndices: number[] = [];
  let lastError: unknown = null;

  for (const candidate of orderedCandidates) {
    const client = createGenAiClient(candidate.apiKey, options.apiVersion);
    try {
      const result = await runner(client, candidate.keyHash);
      if (candidate.userIdx >= 0) {
        res.setHeader("X-Key-Source", "user");
        res.setHeader("X-Used-Key-Idx", String(candidate.userIdx));
      } else {
        res.setHeader("X-Key-Source", "server");
      }
      if (cooledUserIndices.length > 0) {
        res.setHeader("X-Cooldown-Keys", cooledUserIndices.join(","));
      }
      if (invalidUserIndices.length > 0) {
        res.setHeader("X-Invalid-Keys", invalidUserIndices.join(","));
      }
      return result;
    } catch (err) {
      lastError = err;
      if (isQuotaError(err)) {
        keyScopeCooldownUntil.set(`${options.scope}:${candidate.keyHash}`, Date.now() + 10 * 60 * 1000);
        if (candidate.userIdx >= 0) cooledUserIndices.push(candidate.userIdx);
        continue;
      }
      if (isInvalidKeyError(err) || isPermissionError(err)) {
        if (candidate.userIdx >= 0) invalidUserIndices.push(candidate.userIdx);
        continue;
      }
      // Non-key transient error: rethrow so caller's retry logic can handle it
      throw err;
    }
  }

  if (cooledUserIndices.length > 0) {
    res.setHeader("X-Cooldown-Keys", cooledUserIndices.join(","));
  }
  if (invalidUserIndices.length > 0) {
    res.setHeader("X-Invalid-Keys", invalidUserIndices.join(","));
  }
  throw lastError || new Error("تعذر تنفيذ الطلب على جميع المفاتيح المتاحة.");
}

const THEMES = ["auto", "classic", "nature", "luxury", "illustrative", "realistic"] as const;
type Theme = (typeof THEMES)[number];

const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;
type AspectRatio = (typeof ASPECT_RATIOS)[number];

interface GeneratedPost {
  topic: string;
  content: string;
  category?: string;
  narrationStyle?: string;
  versePrefix?: string;
  verseText?: string;
  surahName?: string;
  verseNumber?: string;
  verseReference?: string;
  citations?: SupportingCitation[];
}

const VALID_CITATION_TYPES = new Set<CitationType>(["quran", "hadith", "poetry", "wisdom"]);

const normalizeCitations = (raw: unknown): SupportingCitation[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): SupportingCitation | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const rawType = typeof obj.type === "string" ? (obj.type.trim().toLowerCase() as CitationType) : "wisdom";
      const type: CitationType = VALID_CITATION_TYPES.has(rawType) ? rawType : "wisdom";
      const text = typeof obj.text === "string" ? obj.text.trim() : "";
      if (!text) return null;
      return {
        type,
        label: typeof obj.label === "string" && obj.label.trim() ? obj.label.trim() : CITATION_TYPE_LABELS[type],
        prefix: typeof obj.prefix === "string" && obj.prefix.trim() ? obj.prefix.trim() : undefined,
        text,
        source: typeof obj.source === "string" && obj.source.trim() ? obj.source.trim() : undefined,
      };
    })
    .filter((item): item is SupportingCitation => item !== null)
    .slice(0, 4);
};

const isQuotaError = (error: unknown): boolean => {
  if (!error) return false;
  const err = error as Record<string, unknown>;
  const errorString = JSON.stringify(error) || "";
  const errorMessage = String(err?.message || "");
  const errorStatus = String(err?.status || "");

  return (
    errorMessage.includes("429") ||
    errorStatus.includes("429") ||
    errorStatus.includes("RESOURCE_EXHAUSTED") ||
    errorString.includes("429") ||
    errorString.includes("RESOURCE_EXHAUSTED")
  );
};

const isPermissionError = (error: unknown): boolean => {
  if (!error) return false;
  const err = error as Record<string, unknown>;
  const errorString = JSON.stringify(error) || "";
  const errorMessage = String(err?.message || "");
  const errorStatus = String(err?.status || "");

  return (
    errorMessage.includes("403") ||
    errorStatus.includes("403") ||
    errorStatus.includes("PERMISSION_DENIED") ||
    errorString.includes("403") ||
    errorString.includes("PERMISSION_DENIED")
  );
};

const parseJsonOutput = <T>(rawText: string, fallback: string): T => {
  const text = rawText?.trim() || fallback;
  let jsonStr = text;
  if (text.includes("```json")) {
    jsonStr = text.split("```json")[1].split("```")[0].trim();
  } else if (text.includes("```")) {
    jsonStr = text.split("```")[1].split("```")[0].trim();
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    const fixedJsonStr = jsonStr.replace(/[\u0000-\u001F]+/g, " ");
    return JSON.parse(fixedJsonStr) as T;
  }
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));

  const allowedOrigins = (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  if (allowedOrigins.length > 0) {
    app.use("/api", (req, res, next) => {
      const origin = req.headers.origin?.replace(/\/+$/, "");
      if (origin && (allowedOrigins.includes("*") || allowedOrigins.includes(origin))) {
        res.setHeader("Access-Control-Allow-Origin", allowedOrigins.includes("*") ? "*" : origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type,X-User-Gemini-Keys,X-User-Key-Fallback,X-Verify-Gemini-Key"
        );
        res.setHeader("Access-Control-Expose-Headers", "X-Gemini-Key-Source,X-Gemini-Key-Index");
      }
      if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
      }
      next();
    });
  }

  const TONE_INSTRUCTIONS: Record<string, string> = {
    balanced: "بأسلوب متوازن وعميق الأثر يجمع بين إشراقة المعنى الإيماني وبلاغة التعبير القريب من القلب",
    poetic: "بأسلوب أدبي وجداني رفيع يفيض بالصور البلاغية الحية واللغة الشاعرية الشفيفة التي تلامس شغاف الروح",
    concise: "بأسلوب مكثف وموجز جداً كالحِكم الخالدة؛ جمل قصيرة نابضة بالمعنى تبقى راسخة في الذاكرة",
    spiritual: "بأسلوب روحاني خاشع مفعم بالسكينة والمناجاة واليقين الصادق والدعاء الدافئ",
    narrative: "بأسلوب قصصي وتاريخي مشوق يرسم المشهد بعيون القارئ ويستخلص منه عبرة حيّة لحياتنا اليوم",
  };

  app.post("/api/gemini/content", async (req, res) => {
    const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";
    const toneKey = typeof req.body?.tone === "string" && TONE_INSTRUCTIONS[req.body.tone] ? req.body.tone : "balanced";
    const category = typeof req.body?.category === "string" ? req.body.category.trim() : "موضوع تلقائي";
    const profile = getCategoryEditorialProfile(category);

    if (!topic) {
      res.status(400).json({ error: "الموضوع مطلوب لتوليد المحتوى." });
      return;
    }

    let retries = 3;
    while (retries > 0) {
      try {
        const response = await executeWithSmartKeyRotation(
          req,
          res,
          { scope: "text" },
          (client) =>
            client.models.generateContent({
              model: "gemini-4-hydrogen",
              contents: `اكتب منشوراً إيمانياً استثنائياً بالغة التأثير والإبداع حول: "${topic}"
التصنيف المختار: "${profile.id}"
أسلوب السرد الخاص بهذا التصنيف (${profile.narrationStyleName}):
${profile.narrationBlueprint}
النبرة الإضافية المطلوبة: (${TONE_INSTRUCTIONS[toneKey]}).

معايير الإبداع والسرد والشواهد (إلزامية):
1. العنوان (topic): قصير، مبتكر، شاعري ولافت (من 3 إلى 6 كلمات) يعكس روح تصنيف "${profile.id}".
2. نص السرد (content - بين 280 و520 حرفاً):
   - التزم تماماً بطريقة السرد الخاصة بتصنيف "${profile.id}" المذكورة أعلاه، وابتعد عن المقدمات الإنشائية المكررة أو الأسلوب النمطي الواحد.
   - قدّم صورة حية أو لفتة تدبّرية/تاريخية/تربوية أصيلة واختم بخاتمة بليغة تبقى في الوجدان.
   - استخدم إيموجي راقية ومحدودة (1 إلى 2 فقط كـ ✨ أو 🌿).
3. الشاهد القرآني المحوري (versePrefix و verseText و surahName و verseNumber):
   - اختر آية قرآنية دقيقة ومشكّلة تدعم صلب الموضوع مباشرة (مع اسم السورة ورقم الآية بدقة تامة).
4. مصفوفة الاستشهادات الداعمة (citations - 3 شواهد متنوعة وأصيلة تدعم الموضوع):
   - أدرج بالضبط 3 شواهد داعمة متنوعة تغطي:
     (أ) حديث نبوي شريف صحيح أو حسن (type: "hadith"، مع الراوي والمصدر مثل: رواه البخاري / رواه مسلم / رواه الترمذي).
     (ب) بيت شعر عربي إسلامي أصيل ومؤثر يوافق الموضوع (type: "poetry"، افصل بين الصدر والعجز بعلامة " / " مثل: الشطر الأول / الشطر الثاني، واذكر اسم الشاعر في source).
     (ج) حكمة أو قول مأثور بليغ لأحد العلماء أو الصحابة أو السلف (type: "wisdom"، مع اسم القائل في source مثل: ابن القيم / الإمام الشافعي / عمر بن الخطاب رضي الله عنه).
   - رتّب الشواهد حسب الأنسب لهذا التصنيف (${profile.citationFocusSummary}).

أعد النتيجة بتنسيق JSON حصراً.`,
              config: {
                systemInstruction:
                  "أنت أديب ومؤرخ ومفكر إسلامي متمكن من البلاغة العربية والتدبر القرآني والسيرة والتاريخ والشعر العربي الأصيل. لكل تصنيف عندك بصمته السردية الفريدة فلا تخلط بين أسلوب الخاطرة القرآنية وأسلوب الحكاية التاريخية أو الشعر أو الحديث النبوي. تتحرى الدقة التامة والأمانة العلمية في رسم الآيات القرآنية وأسماء السور وأرقام الآيات، وتوثيق الأحاديث النبوية الصحيحة، ونسبة أبيات الشعر والأقوال المأثورة لقائليها بدقة، وتلتزم دائماً بمخرجات JSON سليمة.",
                responseMimeType: "application/json",
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    content: { type: Type.STRING },
                    versePrefix: { type: Type.STRING },
                    verseText: { type: Type.STRING },
                    surahName: { type: Type.STRING },
                    verseNumber: { type: Type.STRING },
                    citations: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING },
                          label: { type: Type.STRING },
                          prefix: { type: Type.STRING },
                          text: { type: Type.STRING },
                          source: { type: Type.STRING },
                        },
                        required: ["type", "text"],
                      },
                    },
                  },
                  required: ["topic", "content", "citations"],
                },
              },
            })
        );

        const result = parseJsonOutput<GeneratedPost>(response.text || "{}", "{}");
        if (result.surahName && result.verseNumber && !result.verseReference) {
          result.verseReference = `(${result.surahName} : ${result.verseNumber})`;
        }
        result.category = profile.id;
        result.narrationStyle = profile.narrationStyleName;
        result.citations = normalizeCitations(result.citations);

        res.json(result);
        return;
      } catch (error) {
        if (isQuotaError(error)) {
          res.status(429).json({
            error:
              "لقد تجاوزت الحصة المتاحة (Quota) لاستخدام الذكاء الاصطناعي. يرجى الانتظار قليلاً أو التحقق من خطة الاستخدام الخاصة بك.",
          });
          return;
        }
        if (isPermissionError(error)) {
          res.status(403).json({
            error:
              "لا يوجد تصريح لاستخدام هذا النموذج. قد يتطلب مفتاح API مدفوع أو إعدادات خاصة.",
          });
          return;
        }

        console.error(`Content generation error (Attempt ${4 - retries}):`, error);
        retries--;
        if (retries === 0) {
          res.status(500).json({
            error: "فشل في معالجة البيانات بعد عدة محاولات. يرجى المحاولة مرة أخرى.",
          });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  });

  app.post("/api/gemini/image", async (req, res) => {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    const aspectRatio: AspectRatio = ASPECT_RATIOS.includes(req.body?.aspectRatio)
      ? req.body.aspectRatio
      : "1:1";
    const theme: Theme = THEMES.includes(req.body?.theme) ? req.body.theme : "classic";

    if (!prompt) {
      res.status(400).json({ error: "الوصف مطلوب لتوليد الصورة." });
      return;
    }

    let effectiveTheme = theme;
    if (theme === "auto") {
      const availableThemes = THEMES.filter((t) => t !== "auto");
      effectiveTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    }

    const themePrompts: Record<Theme, string> = {
      auto: "",
      classic:
        "Hyper-realistic, traditional, intricate golden Islamic patterns, soft lighting, parchment textures, ancient library or mosque interior with glowing golden lanterns and rich arabesque details. Include elements of nature like plants and flowers if appropriate.",
      nature:
        "Hyper-realistic, lush greenery, vibrant flowers, serene landscapes, organic textures, natural bright sunlight, flowing water, gardens of paradise with misty atmosphere and blooming floral details. Include golden Islamic ornaments integrated into nature.",
      luxury:
        "Hyper-realistic, deep elegant gold accents, high contrast, moody lighting, premium materials, deep shadows, royal atmosphere with velvet, marble, and intricate golden engravings. Surround with desert landscapes or celestial skies.",
      illustrative:
        "Highly detailed and realistic illustrative style, silhouettes of mosques and minarets against a clear night sky with clouds and stars, large crescent moon, hanging golden lanterns (fanous), glowing stars, rich textures, vibrant colors.",
      realistic:
        "Hyper-realistic, photorealistic, natural bright sunlight, crystal clear details, 8k resolution, sharp focus, vibrant natural colors, authentic textures, realistic desert landscapes, clear blue sky with fluffy white clouds, golden Islamic patterns subtly integrated.",
    };

    let retries = 2;
    const currentModel = "gemini-2.5-flash-image";

    while (retries > 0) {
      try {
        const response = await executeWithSmartKeyRotation(
          req,
          res,
          { scope: "image" },
          (client) =>
            client.models.generateContent({
              model: currentModel,
              contents: {
                parts: [
                  {
                    text: `Create a hyper-realistic, photorealistic, 8k resolution, cinematic masterpiece that deeply expresses the essence of: ${prompt}. 
              Theme Style: ${themePrompts[effectiveTheme]}
              
              The visual style must be extremely realistic, with natural bright lighting, high clarity, and intricate details. 
              
              CRITICAL: Aim for maximum diversity and uniqueness in every generation. Avoid repetitive compositions.
              
              Key Visual Elements & Variety (MANDATORY):
              - Heritage: Incorporate elements from the vast Islamic heritage: (Andalusian architecture, Ottoman motifs, Abbasid grandeur, Mamluk patterns, Safavid colors).
              - Elements: Include rich GOLDEN COLORS, intricate ISLAMIC GEOMETRIC PATTERNS, majestic mosques with detailed domes and minarets, lush gardens with flowing water, vibrant FLOWERS, vast DESERTS with golden dunes, and beautiful celestial elements like the SKY, CLOUDS, and STARS.
              - People: You MAY include people in respectful Islamic contexts: individuals praying, reading Quran, walking in ancient cities, or peaceful community gatherings. Ensure they blend naturally and respectfully into the scene.
              - Simplicity vs Complexity: Some images should be rich and detailed, while others can be minimalist, focusing on a single symbolic element like a beautifully crafted golden lantern, a crescent moon, or an open ancient book.
              - Lighting & Color: Use a wide range of color palettes with a strong emphasis on NATURAL BRIGHT SUNLIGHT, golden hues, vibrant colors, and a radiant, glowing atmosphere. Ensure the scene is exceptionally well-lit, clear, and vibrant.
              - Composition: Experiment with different professional cinematic angles (macro close-ups of patterns, wide vistas of cities, low-angle majesty of architecture).
              
              Theme Style: ${themePrompts[effectiveTheme]}
              
              CRITICAL: DO NOT include any text, letters, words, or calligraphy.
              CRITICAL: Ensure the image feels spiritually uplifting, elegant, high-quality, bright, and luminous.`,
                  },
                ],
              },
              config: {
                imageConfig: {
                  aspectRatio,
                },
              },
            })
        );

        const candidate = response.candidates?.[0];
        for (const part of candidate?.content?.parts || []) {
          if (part.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || "image/png";
            res.json({ imageUrl: `data:${mimeType};base64,${part.inlineData.data}` });
            return;
          }
        }

        throw new Error("No image data in response");
      } catch (error) {
        if (isQuotaError(error)) {
          res.status(200).json({
            imageUrl: null,
            fallbackReason: "quota",
            error:
              "لقد تجاوزت الحصة المتاحة (Quota) لتوليد الصور. تم اختيار خلفية إسلامية بديلة تلقائياً.",
          });
          return;
        }
        if (isPermissionError(error)) {
          res.status(200).json({
            imageUrl: null,
            fallbackReason: "permission",
            error:
              "لا يوجد تصريح لاستخدام هذا النموذج لتوليد الصور. تم اختيار خلفية إسلامية بديلة تلقائياً.",
          });
          return;
        }

        console.warn(`Image Generation Warning (Attempt ${retries}, Model ${currentModel}):`, error);
        retries--;
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }

    res.status(200).json({
      imageUrl: null,
      fallbackReason: "error",
      error: "تعذر توليد الصورة بالذكاء الاصطناعي حالياً. تم اختيار خلفية إسلامية بديلة تلقائياً.",
    });
  });

  app.post("/api/gemini/topics", async (req, res) => {
    const category = typeof req.body?.category === "string" ? req.body.category : undefined;
    const profile = getCategoryEditorialProfile(category);
    const randomSeed = Math.floor(Math.random() * 10000);

    const categoryPrompt =
      category && category !== "موضوع تلقائي"
        ? `اقترح 8 عناوين مبتكرة وعميقة جداً تندرج تحديداً تحت تصنيف: "${profile.id}" بأسلوب (${profile.narrationStyleName}).
       توجيه هذا التصنيف: ${profile.topicPromptGuidance}
       ابتعد تماماً عن العناوين العامة المكررة؛ اجعل كل عنوان يحمل هوية هذا التصنيف تحديداً ويثير شغف القراءة والتأمل. (معرف التنوع: ${randomSeed})`
        : `اقترح 8 عناوين إيمانية وثقافية وأدبية فريدة ومؤثرة جداً للنشر في البطاقات والفيديوهات الدعوية. 
       نوّع بين لطائف القرآن، أنوار السيرة، قصص التاريخ، روائع الشعر الإسلامي، جبر الخواطر، وفقه السكينة. 
       اجعل العناوين قصيرة ومباشرة وبليغة وبعيدة تماماً عن التكرار. (معرف التنوع: ${randomSeed})`;

    try {
      const response = await executeWithSmartKeyRotation(
        req,
        res,
        { scope: "text" },
        (client) =>
          client.models.generateContent({
            model: "gemini-4-hydrogen",
            contents: `${categoryPrompt} أريدها كقائمة JSON نصية فقط.`,
            config: {
              responseMimeType: "application/json",
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          })
      );

      const data = parseJsonOutput<string[]>(response.text || "[]", "[]");
      res.json({ topics: Array.isArray(data) ? data : [] });
    } catch (error) {
      if (isQuotaError(error)) {
        res.status(429).json({
          error: "لقد تجاوزت الحصة المتاحة (Quota) لاستخدام الذكاء الاصطناعي.",
        });
        return;
      }
      if (isPermissionError(error)) {
        res.status(403).json({
          error: "لا يوجد تصريح لاستخدام هذا النموذج.",
        });
        return;
      }
      console.error("Error loading suggestions:", error);
      res.status(500).json({ error: "تعذر توليد المواضيع المقترحة." });
    }
  });

  app.post("/api/gemini/daily-dhikr", async (req, res) => {
    const period = req.body?.period === "morning" ? "morning" : "evening";
    try {
      const prompt =
        period === "morning"
          ? "اقترح ذكراً أو دعاءً قصيراً ومؤثراً للصباح. أريد النص فقط بدون أي مقدمات."
          : "اقترح ذكراً أو دعاءً قصيراً ومؤثراً للمساء. أريد النص فقط بدون أي مقدمات.";

      const response = await executeWithSmartKeyRotation(
        req,
        res,
        { scope: "text" },
        (client) =>
          client.models.generateContent({
            model: "gemini-4-hydrogen",
            contents: prompt,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          })
      );

      res.json({ dhikr: response.text?.trim() || "" });
    } catch (error) {
      if (isQuotaError(error)) {
        res.status(429).json({ error: "لقد تجاوزت الحصة المتاحة (Quota)." });
        return;
      }
      console.error("Error loading daily dhikr:", error);
      res.status(500).json({ error: "تعذر تحميل ذكر اليوم." });
    }
  });

  app.post("/api/gemini/series", async (req, res) => {
    const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";
    const toneKey = typeof req.body?.tone === "string" && TONE_INSTRUCTIONS[req.body.tone] ? req.body.tone : "balanced";
    const category = typeof req.body?.category === "string" ? req.body.category.trim() : "موضوع تلقائي";
    const profile = getCategoryEditorialProfile(category);
    const count =
      typeof req.body?.count === "number" && req.body.count > 0 && req.body.count <= 10
        ? Math.floor(req.body.count)
        : 3;

    if (!topic) {
      res.status(400).json({ error: "الموضوع مطلوب لتوليد السلسلة." });
      return;
    }

    let retries = 3;
    while (retries > 0) {
      try {
        const response = await executeWithSmartKeyRotation(
          req,
          res,
          { scope: "text" },
          (client) =>
            client.models.generateContent({
              model: "gemini-4-hydrogen",
              contents: `اكتب سلسلة إيمانية بديعة من ${count} أجزاء مترابطة ومتصاعدة الأثر حول: "${topic}".
التصنيف: "${profile.id}" — أسلوب السرد: (${profile.narrationStyleName}):
${profile.narrationBlueprint}
النبرة: (${TONE_INSTRUCTIONS[toneKey]}).
اجعل الأجزاء متكاملة كرحلة متصاعدة (تمهيد آسر، عمق وتفصيل حيّ، وخاتمة راسخة).

القواعد:
- كل جزء مركّز وبليغ (بين 220 و360 حرفاً) بتعبير أدبي حي يلتزم بهوية تصنيف "${profile.id}".
- أرفق لكل جزء آية قرآنية مناسبة بدقة (مع اسم السورة ورقم الآية).
- أرفق لكل جزء في مصفوفة citations شاهدين داعمين متنوعين (حديث نبوي صحيح + بيت شعر بصيغة "الشطر الأول / الشطر الثاني" أو حكمة مأثورة) مع التوثيق.

أعد النتيجة بتنسيق JSON حصراً كقائمة من الكائنات.`,
              config: {
                systemInstruction:
                  "أنت أديب ومؤرخ ومفكر إسلامي متمكن من البلاغة والتدبر. ولد مخرجات JSON سليمة دائماً مع لغة إيمانية عميقة تناسب التصنيف، والتزم بدقة الآيات والأحاديث وأبيات الشعر والحكم المأثورة.",
                responseMimeType: "application/json",
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      content: { type: Type.STRING },
                      versePrefix: { type: Type.STRING },
                      verseText: { type: Type.STRING },
                      surahName: { type: Type.STRING },
                      verseNumber: { type: Type.STRING },
                      citations: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            type: { type: Type.STRING },
                            label: { type: Type.STRING },
                            prefix: { type: Type.STRING },
                            text: { type: Type.STRING },
                            source: { type: Type.STRING },
                          },
                          required: ["type", "text"],
                        },
                      },
                    },
                    required: ["topic", "content"],
                  },
                },
              },
            })
        );

        const result = parseJsonOutput<GeneratedPost[]>(response.text || "[]", "[]");
        const normalized = result.map((p) => ({
          ...p,
          category: profile.id,
          narrationStyle: profile.narrationStyleName,
          verseReference:
            p.verseReference ||
            (p.surahName && p.verseNumber ? `(${p.surahName} : ${p.verseNumber})` : ""),
          citations: normalizeCitations(p.citations),
        }));

        res.json({ posts: normalized });
        return;
      } catch (error) {
        if (isQuotaError(error)) {
          res.status(429).json({
            error:
              "لقد تجاوزت الحصة المتاحة (Quota) لاستخدام الذكاء الاصطناعي. يرجى الانتظار قليلاً أو التحقق من خطة الاستخدام الخاصة بك.",
          });
          return;
        }
        if (isPermissionError(error)) {
          res.status(403).json({
            error:
              "لا يوجد تصريح لاستخدام هذا النموذج. قد يتطلب مفتاح API مدفوع أو إعدادات خاصة.",
          });
          return;
        }

        console.error(`Series generation error (Attempt ${4 - retries}):`, error);
        retries--;
        if (retries === 0) {
          res.status(500).json({ error: "فشل في توليد السلسلة بعد عدة محاولات." });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  });

  app.post("/api/gemini/refine", async (req, res) => {
    const post = req.body?.post as GeneratedPost | undefined;
    const action = req.body?.action;

    if (!post || typeof post.content !== "string") {
      res.status(400).json({ error: "بيانات المنشور مطلوبة للتحسين." });
      return;
    }

    const actionPrompts: Record<string, string> = {
      shorten: "اختصر هذه الخاطرة واجعلها مكثفة وآسرة في أقل من 220 حرفاً كالحكمة الخالدة، مع الحفاظ على روعة المعنى ونص الآية والشواهد.",
      add_dua: "أضف في نهاية الخاطرة دعاءً وجدانياً دافئاً وقصيراً يتناغم مع معناها دون إطالة زائدة (بحد أقصى 480 حرفاً).",
      polish: "ارتقِ بصياغة الخاطرة بلغة عربية فصيحة رفيعة، وأضف إشراقة بلاغية وتناسقاً في الجمل مع ضبط علامات الترقيم.",
      deepen: "أعد صياغة الخاطرة بعمق إيماني وإبداع أدبي أقوى بكثير يناسب تصنيفها: افتتحها بجملة آسرة تلمس القلب، وأضف صورة بيانية حيّة وزاوية تدبر غير تقليدية وخاتمة تبقى في النفس، مع الحفاظ على دقة الآية والشواهد.",
      enrich_citations: "أثْرِ هذا المنشور بمجموعة شواهد أصيلة ومتنوعة في مصفوفة citations تدعم فكرته بعمق: (1) حديث نبوي شريف صحيح موثّق (type: 'hadith')، (2) بيت شعر عربي إسلامي أصيل بصيغة 'الشطر الأول / الشطر الثاني' مع اسم الشاعر (type: 'poetry')، (3) حكمة أو قول مأثور بليغ لأحد العلماء أو السلف (type: 'wisdom'). حافظ على نص الخاطرة والآية القرآنية سليمة ومنسجمة.",
    };

    const instruction = actionPrompts[typeof action === "string" ? action : "polish"] || actionPrompts.polish;

    try {
      const response = await executeWithSmartKeyRotation(
        req,
        res,
        { scope: "text" },
        (client) =>
          client.models.generateContent({
            model: "gemini-4-hydrogen",
            contents: `${instruction}\n\nالمنشور الحالي:\nالتصنيف: ${post.category || "موضوع تلقائي"}\nأسلوب السرد: ${post.narrationStyle || ""}\nالعنوان: ${post.topic}\nالمحتوى: ${post.content}\nمقدمة الآية: ${post.versePrefix || ""}\nالآية/الشاهد الرئيسي: ${post.verseText || ""}\nالمرجع: ${post.verseReference || ""}\nالشواهد الحالية: ${JSON.stringify(post.citations || [])}`,
            config: {
              systemInstruction:
                "أنت محرر محتوى إسلامي وأديب بليغ. أعد المنشور المحسّن بصيغة JSON سليمة وحافظ على دقة الآيات القرآنية والأحاديث النبوية الصحيحة وأبيات الشعر والحكم المأثورة.",
              responseMimeType: "application/json",
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  content: { type: Type.STRING },
                  versePrefix: { type: Type.STRING },
                  verseText: { type: Type.STRING },
                  surahName: { type: Type.STRING },
                  verseNumber: { type: Type.STRING },
                  verseReference: { type: Type.STRING },
                  citations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING },
                        label: { type: Type.STRING },
                        prefix: { type: Type.STRING },
                        text: { type: Type.STRING },
                        source: { type: Type.STRING },
                      },
                      required: ["type", "text"],
                    },
                  },
                },
                required: ["topic", "content"],
              },
            },
          })
      );

      const result = parseJsonOutput<GeneratedPost>(response.text || "{}", "{}");
      const normalizedCitations = normalizeCitations(result.citations);
      res.json({
        ...post,
        ...result,
        verseText: post.verseText || result.verseText,
        verseReference: post.verseReference || result.verseReference,
        citations: normalizedCitations.length > 0 ? normalizedCitations : post.citations,
      });
    } catch (error) {
      if (isQuotaError(error)) {
        res.status(429).json({ error: "لقد تجاوزت الحصة المتاحة (Quota) مؤقتاً." });
        return;
      }
      console.error("Refine error:", error);
      res.status(500).json({ error: "تعذر تحسين الصياغة حالياً." });
    }
  });

  // In-memory LRU cache & quota cooldown tracker for TTS to protect free-tier quota
  const ttsAudioCache = new Map<string, string>();
  const TTS_CACHE_MAX = 60;
  const ttsModelCooldownUntil = new Map<string, number>();
  const TTS_MODELS = ["gemini-3.8-flash-lite-tts", "gemini-3.8-flash-tts"] as const;

  const parseQuotaCooldownMs = (err: unknown): number => {
    const raw = err instanceof Error ? err.message : String(err || "");
    const match = raw.match(/retryDelay["']?\s*[:=]\s*["']?(\d+)s/i);
    if (match) {
      const secs = Number(match[1]);
      if (Number.isFinite(secs) && secs > 0) {
        return Math.min(secs * 1000, 60 * 60 * 1000);
      }
    }
    return 15 * 60 * 1000;
  };

  app.post("/api/gemini/tts", async (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim().slice(0, 1200) : "";
    const type = req.body?.type === "reflection" ? "reflection" : "verse";
    const requestedVoice = typeof req.body?.voiceName === "string" ? req.body.voiceName : "";
    const voiceName = ALLOWED_TTS_VOICES.has(requestedVoice)
      ? requestedVoice
      : type === "verse"
      ? "Charon"
      : "Kore";

    if (!text) {
      res.status(400).json({ error: "النص مطلوب لتوليد الصوت." });
      return;
    }

    const cacheKey = `${type}:${voiceName}:${text}`;
    const cachedUrl = ttsAudioCache.get(cacheKey);
    if (cachedUrl) {
      res.json({ audioUrl: cachedUrl, cached: true });
      return;
    }

    try {
      const style =
        type === "verse"
          ? "Reverent, calm, articulate Classical Arabic spiritual recitation with measured pauses and serene warmth"
          : "Warm, calm, inspiring Classical Arabic voiceover with gentle contemplative pacing";

      const response = await executeWithSmartKeyRotation(
        req,
        res,
        { scope: "tts", apiVersion: "v1beta" },
        async (client, keyHash) => {
          const now = Date.now();
          let lastError: unknown = null;
          let sawQuotaError = false;

          for (const modelName of TTS_MODELS) {
            const cooldownKey = `${keyHash}:${modelName}`;
            const cooldownUntil = ttsModelCooldownUntil.get(cooldownKey) || 0;
            if (cooldownUntil > now) {
              sawQuotaError = true;
              continue;
            }

            try {
              return await client.models.generateContent({
                model: modelName,
                contents: [
                  {
                    role: "user",
                    parts: [
                      {
                        text,
                        speechMetadata: { style },
                      } as Record<string, unknown>,
                    ],
                  },
                ],
                config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName },
                    },
                  },
                },
              });
            } catch (modelErr) {
              lastError = modelErr;
              if (isQuotaError(modelErr)) {
                sawQuotaError = true;
                ttsModelCooldownUntil.set(cooldownKey, Date.now() + parseQuotaCooldownMs(modelErr));
                continue;
              }
              if (isInvalidKeyError(modelErr) || isPermissionError(modelErr)) {
                throw modelErr;
              }
            }
          }

          if (sawQuotaError) {
            throw Object.assign(new Error("RESOURCE_EXHAUSTED"), { status: 429 });
          }
          throw lastError || new Error("All TTS models failed");
        }
      );

      const parts = response.candidates?.[0]?.content?.parts || [];
      const audioPart = parts.find((p) => p.inlineData?.data);
      const base64Audio = audioPart?.inlineData?.data;
      const mimeType = audioPart?.inlineData?.mimeType || "audio/wav";

      if (!base64Audio) {
        res.status(502).json({ error: "لم يتم استلام بيانات صوتية من النموذج." });
        return;
      }

      const audioUrl = `data:${mimeType};base64,${base64Audio}`;
      if (ttsAudioCache.size >= TTS_CACHE_MAX) {
        const oldestKey = ttsAudioCache.keys().next().value;
        if (oldestKey) ttsAudioCache.delete(oldestKey);
      }
      ttsAudioCache.set(cacheKey, audioUrl);

      res.json({ audioUrl });
    } catch (error) {
      if (isQuotaError(error)) {
        res.status(429).json({
          error:
            "تم بلوغ الحد اليومي المجاني للقراءة الصوتية بالذكاء الاصطناعي. يمكنك إضافة مفتاح إضافي من الإعدادات أو استخدام التلاوة القرآنية الأصلية للقراء الستة بلا حدود.",
          quotaExceeded: true,
        });
        return;
      }
      if (isPermissionError(error) || isInvalidKeyError(error)) {
        res.status(403).json({ error: "لا يوجد تصريح لاستخدام نموذج الصوت على هذا المفتاح." });
        return;
      }
      res.status(500).json({ error: "تعذر توليد التلاوة الصوتية حالياً." });
    }
  });

  // Verify a user-supplied Gemini API key without logging or storing it
  app.post("/api/gemini/verify-key", async (req, res) => {
    const rawKey = (req.header("X-Verify-Gemini-Key") || "").trim();
    if (
      !rawKey ||
      rawKey.length < 20 ||
      rawKey.length > 200 ||
      /\s/.test(rawKey) ||
      !/^[\x21-\x7E]+$/.test(rawKey)
    ) {
      res.status(400).json({ valid: false, message: "صيغة المفتاح غير صالحة." });
      return;
    }

    try {
      const client = createGenAiClient(rawKey);
      await client.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: "قل كلمة واحدة: نعم",
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          maxOutputTokens: 8,
        },
      });
      res.json({ valid: true, message: "المفتاح سليم ويعمل بكفاءة، وجاهز للتدوير التلقائي." });
    } catch (err) {
      if (isQuotaError(err)) {
        res.json({
          valid: false,
          quotaExceeded: true,
          message: "المفتاح صحيح لكن حصته الحالية ممتلئة مؤقتاً — سيتجاوزه التدوير تلقائياً حتى تعود حصته.",
        });
        return;
      }
      if (isInvalidKeyError(err) || isPermissionError(err)) {
        res.json({
          valid: false,
          message: "المفتاح غير صالح أو لا يملك صلاحية الوصول لـ Gemini API.",
        });
        return;
      }
      res.json({ valid: false, message: "تعذر التحقق من المفتاح حالياً، حاول مجدداً." });
    }
  });

  app.post("/api/quran/recitation", async (req, res) => {
    try {
      const requestedReciter = typeof req.body?.reciter === "string" ? req.body.reciter.trim() : "ar.alafasy";
      const reciterId = ALLOWED_RECITER_IDS.has(requestedReciter) ? requestedReciter : "ar.alafasy";
      const reciter = getReciterById(reciterId);

      const surahNumber =
        typeof req.body?.surahNumber === "number" && Number.isInteger(req.body.surahNumber)
          ? req.body.surahNumber
          : undefined;
      const surahName = typeof req.body?.surahName === "string" ? req.body.surahName.slice(0, 120) : undefined;
      const verseNumber = typeof req.body?.verseNumber === "string" ? req.body.verseNumber.slice(0, 40) : undefined;
      const verseReference =
        typeof req.body?.verseReference === "string" ? req.body.verseReference.slice(0, 160) : undefined;
      const verseText = typeof req.body?.verseText === "string" ? req.body.verseText.trim().slice(0, 400) : "";

      let parsed = parseQuranReference({
        surahNumber,
        surahName,
        verseNumber,
        verseReference,
      });

      // If no explicit Surah:Ayah metadata matched, attempt a safe lookup by Quranic verse snippet
      if (!parsed && verseText.length >= 10) {
        const cleanedWords = normalizeArabic(verseText)
          .replace(/[﴿﴾()«»"':،.؛؟!]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length >= 2)
          .slice(0, 5)
          .join(" ");

        if (cleanedWords.length >= 6) {
          const searchResp = await fetch(
            `https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanedWords)}/all/quran-simple-clean`
          );
          if (searchResp.ok) {
            const searchJson = (await searchResp.json()) as {
              code?: number;
              data?: {
                matches?: Array<{
                  surah?: { number?: number; name?: string };
                  numberInSurah?: number;
                }>;
              };
            };
            const firstMatch = searchJson?.data?.matches?.[0];
            if (
              firstMatch?.surah?.number &&
              firstMatch?.numberInSurah &&
              firstMatch.surah.number >= 1 &&
              firstMatch.surah.number <= 114
            ) {
              parsed = parseQuranReference({
                surahNumber: firstMatch.surah.number,
                verseNumber: String(firstMatch.numberInSurah),
              });
            }
          }
        }
      }

      if (!parsed) {
        res.json({
          resolved: false,
          reciterId: reciter.id,
          reciterName: reciter.name,
        });
        return;
      }

      const clips: Array<{ ayah: number; base64: string; mimeType: string }> = [];
      for (let ayah = parsed.ayahStart; ayah <= parsed.ayahEnd; ayah++) {
        const metaResp = await fetch(
          `https://api.alquran.cloud/v1/ayah/${parsed.surah}:${ayah}/${encodeURIComponent(reciter.id)}`
        );
        if (!metaResp.ok) continue;

        const metaJson = (await metaResp.json()) as {
          code?: number;
          data?: { audio?: string; audioSecondary?: string[] };
        };
        const candidateUrls = [
          metaJson?.data?.audio,
          ...(Array.isArray(metaJson?.data?.audioSecondary) ? metaJson.data.audioSecondary : []),
        ].filter((u): u is string => typeof u === "string" && isAllowedIslamicAudioUrl(u));

        let fetchedClip: Buffer | null = null;
        for (const audioUrl of candidateUrls) {
          const audioResp = await fetch(audioUrl);
          if (audioResp.ok) {
            const arrBuf = await audioResp.arrayBuffer();
            if (arrBuf.byteLength > 100 && arrBuf.byteLength <= 8 * 1024 * 1024) {
              fetchedClip = Buffer.from(arrBuf);
              break;
            }
          }
        }

        if (fetchedClip) {
          clips.push({
            ayah,
            base64: fetchedClip.toString("base64"),
            mimeType: "audio/mpeg",
          });
        }
      }

      if (clips.length === 0) {
        res.json({
          resolved: false,
          reciterId: reciter.id,
          reciterName: reciter.name,
        });
        return;
      }

      res.json({
        resolved: true,
        surah: parsed.surah,
        ayahStart: parsed.ayahStart,
        ayahEnd: parsed.ayahEnd,
        surahNameAr: parsed.surahNameAr,
        reciterId: reciter.id,
        reciterName: reciter.name,
        clips,
      });
    } catch (error) {
      console.error("Quran recitation proxy error:", error);
      res.status(502).json({ error: "تعذر جلب التلاوة القرآنية حالياً." });
    }
  });

  app.post("/api/video/render-mp4", async (req, res) => {
    const backgroundBase64 = typeof req.body?.backgroundPngBase64 === "string" ? req.body.backgroundPngBase64 : "";
    const overlayBase64 = typeof req.body?.overlayPngBase64 === "string" ? req.body.overlayPngBase64 : "";
    const audioBase64 = typeof req.body?.audioBase64 === "string" ? req.body.audioBase64 : "";
    const audioMimeType =
      typeof req.body?.audioMimeType === "string" && ALLOWED_VIDEO_MIMES.has(req.body.audioMimeType)
        ? req.body.audioMimeType
        : "audio/wav";
    const motionStyle =
      typeof req.body?.motionStyle === "string" && ALLOWED_MOTION_STYLES.has(req.body.motionStyle)
        ? req.body.motionStyle
        : "kenburns";

    const rawWidth = Number(req.body?.width) || 1080;
    const rawHeight = Number(req.body?.height) || 1080;
    const width = Math.min(1920, Math.max(360, Math.floor(rawWidth / 2) * 2));
    const height = Math.min(1920, Math.max(360, Math.floor(rawHeight / 2) * 2));
    const rawDuration = Number(req.body?.durationSec) || 10;
    const durationSec = Math.min(90, Math.max(3, Number(rawDuration.toFixed(2))));

    if (!backgroundBase64 || !overlayBase64 || !audioBase64) {
      res.status(400).json({ error: "بيانات الصورة والصوت مطلوبة لتصدير الفيديو." });
      return;
    }

    const stripDataPrefix = (b64: string) => {
      const idx = b64.indexOf(",");
      return idx >= 0 ? b64.slice(idx + 1) : b64;
    };

    const workDir = path.join(os.tmpdir(), `noor-video-${crypto.randomUUID()}`);

    try {
      await fs.mkdir(workDir, { recursive: true });

      const bgBuffer = Buffer.from(stripDataPrefix(backgroundBase64), "base64");
      const overlayBuffer = Buffer.from(stripDataPrefix(overlayBase64), "base64");
      const audioBuffer = Buffer.from(stripDataPrefix(audioBase64), "base64");

      if (
        bgBuffer.byteLength < 100 ||
        overlayBuffer.byteLength < 100 ||
        audioBuffer.byteLength < 100 ||
        bgBuffer.byteLength > 15 * 1024 * 1024 ||
        overlayBuffer.byteLength > 15 * 1024 * 1024 ||
        audioBuffer.byteLength > 35 * 1024 * 1024
      ) {
        res.status(400).json({ error: "حجم ملفات التصميم أو الصوت غير صالح للتصدير." });
        return;
      }

      const isBgJpeg = bgBuffer[0] === 0xff && bgBuffer[1] === 0xd8;
      const audioExt = audioMimeType === "audio/mpeg" || audioMimeType === "audio/mp3" ? "mp3" : "wav";
      const bgPath = ensureSafeWorkFile(workDir, isBgJpeg ? "background.jpg" : "background.png");
      const overlayPath = ensureSafeWorkFile(workDir, "overlay.png");
      const audioPath = ensureSafeWorkFile(workDir, `audio.${audioExt}`);
      const outputPath = ensureSafeWorkFile(workDir, "output.mp4");

      await Promise.all([
        fs.writeFile(bgPath, bgBuffer),
        fs.writeFile(overlayPath, overlayBuffer),
        fs.writeFile(audioPath, audioBuffer),
      ]);

      const fadeOutStart = Math.max(0.5, Number((durationSec - 0.8).toFixed(2)));

      const buildStaticArgs = (): string[] => {
        const staticFps = 4;
        const filterComplex = [
          `[0:v]scale=${width}:${height}:flags=lanczos[bg]`,
          `[1:v]scale=${width}:${height}:flags=lanczos[ov]`,
          `[bg][ov]overlay=0:0:eof_action=repeat,fade=t=in:st=0:d=0.6,format=yuv420p[vout]`,
        ].join(";");

        return [
          "-y",
          "-loop", "1", "-framerate", String(staticFps), "-t", String(durationSec), "-i", bgPath,
          "-i", overlayPath,
          "-i", audioPath,
          "-filter_complex", filterComplex,
          "-map", "[vout]",
          "-map", "2:a",
          "-c:v", "libx264",
          "-preset", "ultrafast",
          "-crf", "17",
          "-tune", "stillimage",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-ac", "2",
          "-b:a", "192k",
          "-ar", "44100",
          "-af", `afade=t=out:st=${fadeOutStart}:d=0.75`,
          "-movflags", "+faststart",
          "-t", String(durationSec),
          outputPath,
        ];
      };

      const buildKenBurnsArgs = (): string[] => {
        // Adapt output scale proportionally (exact aspect ratio, zero distortion) so even 60s-90s recitations finish in ~4-8s
        const maxDim = Math.max(width, height);
        const targetMaxDim = durationSec > 20 || maxDim > 1280 ? 1280 : maxDim;
        const scaleRatio = targetMaxDim < maxDim ? targetMaxDim / maxDim : 1;
        const outW = Math.max(360, Math.floor((width * scaleRatio) / 2) * 2);
        const outH = Math.max(360, Math.floor((height * scaleRatio) / 2) * 2);

        const kbFps = durationSec > 45 ? 12 : 15;
        const totalFrames = Math.max(36, Math.ceil(durationSec * kbFps));
        const maxZoom = motionStyle === "kenburns" ? 1.08 : 1.05;
        const zoomIncrement = ((maxZoom - 1) / totalFrames).toFixed(6);

        // Give zoompan 1.10x proportional headroom (exact same aspect ratio!)
        const bgW = Math.floor((outW * 1.1) / 2) * 2;
        const bgH = Math.floor((outH * 1.1) / 2) * 2;

        const filterComplex = [
          `[0:v]scale=${bgW}:${bgH}:flags=fast_bilinear,zoompan=z='min(zoom+${zoomIncrement},${maxZoom})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${outW}x${outH}:fps=${kbFps}[bg]`,
          `[1:v]scale=${outW}:${outH}:flags=lanczos[ov]`,
          `[bg][ov]overlay=0:0:eof_action=repeat,fade=t=in:st=0:d=0.6,format=yuv420p[vout]`,
        ].join(";");

        return [
          "-y",
          "-i", bgPath,
          "-i", overlayPath,
          "-i", audioPath,
          "-filter_complex", filterComplex,
          "-map", "[vout]",
          "-map", "2:a",
          "-c:v", "libx264",
          "-preset", "ultrafast",
          "-crf", "18",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-ac", "2",
          "-b:a", "192k",
          "-ar", "44100",
          "-af", `afade=t=out:st=${fadeOutStart}:d=0.75`,
          "-movflags", "+faststart",
          "-t", String(durationSec),
          outputPath,
        ];
      };

      const primaryArgs = motionStyle === "static" ? buildStaticArgs() : buildKenBurnsArgs();

      try {
        await execFileAsync("ffmpeg", primaryArgs, {
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024,
        });
      } catch (primaryErr) {
        if (motionStyle === "static") throw primaryErr;
        console.warn("Ken Burns FFmpeg pass fell back to crisp 1080p stillimage mode:", (primaryErr as Error)?.message);
        await execFileAsync("ffmpeg", buildStaticArgs(), {
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024,
        });
      }

      const mp4Buffer = await fs.readFile(outputPath);
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", 'attachment; filename="noor-islamic-reel.mp4"');
      res.setHeader("Content-Length", String(mp4Buffer.byteLength));
      res.send(mp4Buffer);
    } catch (error) {
      const stderr = (error as { stderr?: string })?.stderr?.slice(-400);
      console.error("FFmpeg MP4 render error:", (error as Error)?.message, stderr || "");
      res.status(500).json({ error: "تعذر تجميع الفيديو بصيغة MP4 حالياً. يرجى المحاولة مرة أخرى." });
    } finally {
      await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  app.post(
    "/api/video/remux-mp4",
    express.raw({ type: ["video/webm", "application/octet-stream"], limit: "60mb" }),
    async (req, res) => {
      const inputBuffer = req.body as Buffer;
      if (!Buffer.isBuffer(inputBuffer) || inputBuffer.byteLength < 1024) {
        res.status(400).json({ error: "ملف الفيديو المسجل غير مكتمل." });
        return;
      }

      const workDir = path.join(os.tmpdir(), `noor-remux-${crypto.randomUUID()}`);
      try {
        await fs.mkdir(workDir, { recursive: true });
        const inputPath = ensureSafeWorkFile(workDir, "input.webm");
        const outputPath = ensureSafeWorkFile(workDir, "output.mp4");
        await fs.writeFile(inputPath, inputBuffer);

        await execFileAsync(
          "ffmpeg",
          [
            "-y",
            "-i", inputPath,
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", "19",
            "-pix_fmt", "yuv420p",
            "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
            "-c:a", "aac",
            "-ac", "2",
            "-b:a", "192k",
            "-ar", "44100",
            "-movflags", "+faststart",
            outputPath,
          ],
          { timeout: 90000, maxBuffer: 10 * 1024 * 1024 }
        );

        const mp4Buffer = await fs.readFile(outputPath);
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", 'attachment; filename="noor-islamic-reel.mp4"');
        res.setHeader("Content-Length", String(mp4Buffer.byteLength));
        res.send(mp4Buffer);
      } catch (error) {
        console.error("FFmpeg remux error:", error);
        res.status(500).json({ error: "تعذر تحويل الفيديو إلى MP4 حالياً." });
      } finally {
        await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
      }
    }
  );

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      plugins: [
        {
          name: "noor-disable-hmr-client-ws",
          enforce: "post",
          transform(code, id) {
            if (id.replace(/\\/g, "/").endsWith("/vite/dist/client/client.mjs")) {
              const patched = code.replace(
                /const transport = normalizeModuleRunnerTransport\(\s*\(\(\) => \{[\s\S]*?\}\)\(\)\s*\);/,
                "const transport = normalizeModuleRunnerTransport({ async connect() {}, async disconnect() {}, send() {} });"
              );
              return { code: patched, map: null };
            }
          },
        },
      ],
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
