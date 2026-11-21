import {
  getCategoryFallbackTopics,
  getLocalFallbackImage,
  getLocalFallbackPost,
} from './localArchive';
import { SupportingCitation } from '../utils/categoryEditorial';
import { getReciterById, parseQuranReference } from '../utils/quranData';
import {
  buildGeminiRequestContext,
  recordGeminiResponseRotation,
} from './aiKeyManager';
import {
  getApiUrl,
  isStaticHostWithoutBackend,
  markBackendUnavailableIfStatic,
  safeReadJson,
} from './apiEnvironment';

async function postGeminiApi(endpoint: string, payload: unknown): Promise<Response> {
  const { headers, sentKeyIds } = buildGeminiRequestContext();
  const response = await fetch(getApiUrl(endpoint), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  markBackendUnavailableIfStatic(response);
  recordGeminiResponseRotation(response, sentKeyIds);
  return response;
}

export const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;
export const IMAGE_SIZES = ["1K", "2K", "4K"] as const;
export const THEMES = ["auto", "classic", "nature", "luxury", "illustrative", "realistic"] as const;

export type AspectRatio = (typeof ASPECT_RATIOS)[number];
export type ImageSize = (typeof IMAGE_SIZES)[number];
export type Theme = (typeof THEMES)[number];
export type PostTone = "balanced" | "poetic" | "concise" | "spiritual" | "narrative";
export type RefineAction = "deepen" | "enrich_citations" | "shorten" | "add_dua" | "polish";

export const TONE_LABELS: Record<PostTone, string> = {
  balanced: "متوازن وعميق",
  poetic: "أدبي وجداني بليغ",
  concise: "مختصر وحكيم",
  spiritual: "روحاني وخاشع",
  narrative: "قصصي ومشوق",
};

export const THEME_LABELS: Record<Theme, string> = {
  auto: "تلقائي (عشوائي)",
  classic: "كلاسيكي",
  nature: "طبيعة",
  luxury: "فخامة داكنة",
  illustrative: "رسم توضيحي (سيلويت)",
  realistic: "واقعي ومشرق"
};

export interface GeneratedPost {
  topic: string;
  content: string;
  category?: string;
  narrationStyle?: string;
  versePrefix?: string;
  verseText?: string;
  surahNumber?: number;
  surahName?: string;
  verseNumber?: string;
  verseReference?: string;
  citations?: SupportingCitation[];
}

export interface QuranRecitationResponse {
  resolved: boolean;
  surah?: number;
  ayahStart?: number;
  ayahEnd?: number;
  surahNameAr?: string;
  reciterId: string;
  reciterName: string;
  clips?: Array<{ ayah: number; base64: string; mimeType: string }>;
}

export interface GeneratedImageResult {
  imageUrl: string;
  isFallback: boolean;
  fallbackReason?: string;
  message?: string;
}

// Persistent cache using localStorage
const getCache = (key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(`noor_cache_${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache for 24 hours
      if (Date.now() - timestamp < 1000 * 60 * 60 * 24) {
        return data;
      }
    }
  } catch {
    return null;
  }
  return null;
};

const setCache = (key: string, data: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`noor_cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
};

const FALLBACK_MORNING_ADHKAR = [
  "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
  "اللهم بك أصبحنا وبك أمسينا، وبك نحيا وبك نموت وإليك النشور",
  "سبحان الله وبحمده، عدد خلقه، ورضا نفسه، وزنة عرشه، ومداد كلماته",
  "اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً",
  "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين",
];

const FALLBACK_EVENING_ADHKAR = [
  "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
  "اللهم بك أمسينا وبك أصبحنا، وبك نحيا وبك نموت وإليك المصير",
  "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً",
  "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم",
  "اللهم إني أسألك العفو والعافية في الدنيا والآخرة",
];

const getLocalDailyDhikr = (period: 'morning' | 'evening'): string => {
  const pool = period === 'morning' ? FALLBACK_MORNING_ADHKAR : FALLBACK_EVENING_ADHKAR;
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return pool[dayOfYear % pool.length];
};

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return btoa(binary);
}

async function fetchDirectQuranRecitation(params: {
  surahNumber?: number;
  surahName?: string;
  verseNumber?: string;
  verseReference?: string;
  verseText?: string;
  reciter?: string;
}): Promise<QuranRecitationResponse | null> {
  const reciter = getReciterById(params.reciter);
  const parsed = parseQuranReference(params);
  if (!parsed) return null;

  try {
    const clips: Array<{ ayah: number; base64: string; mimeType: string }> = [];
    for (let ayah = parsed.ayahStart; ayah <= parsed.ayahEnd; ayah++) {
      const metaResp = await fetch(
        `https://api.alquran.cloud/v1/ayah/${parsed.surah}:${ayah}/${reciter.id}`
      );
      if (!metaResp.ok) continue;
      const meta = await safeReadJson<{ data?: { audio?: string; audioSecondary?: string[] } }>(metaResp);
      const audioUrl = meta?.data?.audio || meta?.data?.audioSecondary?.[0];
      if (!audioUrl) continue;

      const audioResp = await fetch(audioUrl);
      if (!audioResp.ok) continue;
      const arrBuf = await audioResp.arrayBuffer();
      clips.push({
        ayah,
        base64: uint8ArrayToBase64(new Uint8Array(arrBuf)),
        mimeType: audioResp.headers.get('content-type') || 'audio/mpeg',
      });
    }

    if (clips.length === 0) return null;
    return {
      resolved: true,
      surah: parsed.surah,
      ayahStart: parsed.ayahStart,
      ayahEnd: parsed.ayahEnd,
      surahNameAr: parsed.surahNameAr,
      reciterId: reciter.id,
      reciterName: reciter.name,
      clips,
    };
  } catch {
    return null;
  }
}

export async function generateReligiousContent(
  topic: string,
  tone: PostTone = "balanced",
  category: string = "موضوع تلقائي"
): Promise<GeneratedPost> {
  if (isStaticHostWithoutBackend()) {
    return getLocalFallbackPost(category, topic);
  }

  const response = await postGeminiApi("/api/gemini/content", { topic, tone, category });
  const data = await safeReadJson<GeneratedPost & { error?: string }>(response);

  if (!response.ok || !data) {
    if (response.status === 405 || !data) {
      return getLocalFallbackPost(category, topic);
    }
    throw new Error(data.error || "فشل في معالجة البيانات. يرجى المحاولة مرة أخرى.");
  }

  return data;
}

export async function generateReligiousImageWithMeta(
  prompt: string,
  aspectRatio: AspectRatio = "1:1",
  theme: Theme = "classic"
): Promise<GeneratedImageResult> {
  if (isStaticHostWithoutBackend()) {
    return {
      imageUrl: getLocalFallbackImage(prompt),
      isFallback: true,
      fallbackReason: "static-host",
      message: "تم اختيار مشهد فوتوغرافي إسلامي ملائم من المكتبة المحلية عالية الجودة.",
    };
  }

  try {
    const response = await postGeminiApi("/api/gemini/image", { prompt, aspectRatio, theme });
    const data = await safeReadJson<{ imageUrl?: string; fallbackReason?: string; error?: string }>(response);

    if (response.ok && data?.imageUrl) {
      return {
        imageUrl: data.imageUrl,
        isFallback: false,
      };
    }

    return {
      imageUrl: getLocalFallbackImage(prompt),
      isFallback: true,
      fallbackReason: data?.fallbackReason || "unavailable",
      message: data?.error,
    };
  } catch {
    return {
      imageUrl: getLocalFallbackImage(prompt),
      isFallback: true,
      fallbackReason: "network",
    };
  }
}

export async function generateReligiousImage(
  prompt: string,
  aspectRatio: AspectRatio = "1:1",
  theme: Theme = "classic"
): Promise<string> {
  const result = await generateReligiousImageWithMeta(prompt, aspectRatio, theme);
  return result.imageUrl;
}

export async function suggestTopics(category?: string, forceRefresh: boolean = false): Promise<string[]> {
  const cacheKey = `topics_${category || 'default'}`;
  const fallbackList = getCategoryFallbackTopics(category);

  if (isStaticHostWithoutBackend()) {
    return forceRefresh ? [...fallbackList].sort(() => Math.random() - 0.5) : fallbackList;
  }

  if (!forceRefresh) {
    const cached = getCache(cacheKey);
    if (Array.isArray(cached) && cached.length > 0) return cached;
  }

  try {
    const response = await postGeminiApi("/api/gemini/topics", { category });
    const data = await safeReadJson<{ topics?: string[] }>(response);
    if (!response.ok || !data) {
      if (forceRefresh) {
        return [...fallbackList].sort(() => Math.random() - 0.5);
      }
      return fallbackList;
    }

    const topics = Array.isArray(data.topics) && data.topics.length > 0 ? data.topics : fallbackList;
    setCache(cacheKey, topics);
    return topics;
  } catch (error) {
    console.warn("Suggestions fallback used:", error);
    return forceRefresh ? [...fallbackList].sort(() => Math.random() - 0.5) : fallbackList;
  }
}

export async function getDailyDhikr(): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const period = now.getHours() < 12 ? 'morning' : 'evening';
  const cacheKey = `daily_dhikr_${dateStr}_${period}`;
  const fallbackDhikr = getLocalDailyDhikr(period);

  if (isStaticHostWithoutBackend()) {
    return fallbackDhikr;
  }

  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await postGeminiApi("/api/gemini/daily-dhikr", { period });
    if (!response.ok) {
      return fallbackDhikr;
    }

    const data = await safeReadJson<{ dhikr?: string }>(response);
    const dhikr = data?.dhikr?.trim() || fallbackDhikr;
    setCache(cacheKey, dhikr);
    return dhikr;
  } catch (error) {
    console.warn("Daily dhikr fallback used:", error);
    return fallbackDhikr;
  }
}

export async function generateReligiousSeries(
  topic: string,
  count: number = 3,
  tone: PostTone = "balanced",
  category: string = "موضوع تلقائي"
): Promise<GeneratedPost[]> {
  if (isStaticHostWithoutBackend()) {
    const safeCount = Math.max(1, Math.min(5, count));
    const topics = getCategoryFallbackTopics(category);
    return Array.from({ length: safeCount }, (_, idx) =>
      getLocalFallbackPost(category, idx === 0 ? topic : topics[idx % topics.length] || topic)
    );
  }

  const response = await postGeminiApi("/api/gemini/series", { topic, count, tone, category });
  const data = await safeReadJson<{ posts?: GeneratedPost[]; error?: string }>(response);
  if (!response.ok || !data) {
    if (response.status === 405 || !data) {
      return [getLocalFallbackPost(category, topic)];
    }
    throw new Error(data.error || "فشل في توليد السلسلة.");
  }

  return Array.isArray(data.posts) ? data.posts : [];
}

export async function refineReligiousContent(post: GeneratedPost, action: RefineAction): Promise<GeneratedPost> {
  if (isStaticHostWithoutBackend()) {
    throw new Error(
      "ميزة التحسين الفوري بالذكاء الاصطناعي تتطلب تشغيل الخادم الخلفي (Node.js). يمكنك تعديل النص يدوياً من تبويب «تعديل النص»."
    );
  }

  const response = await postGeminiApi("/api/gemini/refine", { post, action });
  const data = await safeReadJson<GeneratedPost & { error?: string }>(response);
  if (!response.ok || !data) {
    throw new Error(data?.error || "تعذر تحسين الصياغة حالياً.");
  }

  return data;
}

export async function fetchQuranRecitation(params: {
  surahNumber?: number;
  surahName?: string;
  verseNumber?: string;
  verseReference?: string;
  verseText?: string;
  reciter?: string;
}): Promise<QuranRecitationResponse | null> {
  if (isStaticHostWithoutBackend()) {
    return fetchDirectQuranRecitation(params);
  }

  try {
    const response = await fetch(getApiUrl("/api/quran/recitation"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (markBackendUnavailableIfStatic(response) || !response.ok) {
      return fetchDirectQuranRecitation(params);
    }
    const data = await safeReadJson<QuranRecitationResponse>(response);
    return data || fetchDirectQuranRecitation(params);
  } catch (error) {
    console.warn("Quran Recitation Fetch Error:", error);
    return fetchDirectQuranRecitation(params);
  }
}

export async function fetchQuranAudio(
  surahNumber: number,
  verseNumber: number,
  reciter: string = "ar.alafasy"
): Promise<string | null> {
  try {
    const result = await fetchQuranRecitation({
      surahNumber,
      verseNumber: String(verseNumber),
      reciter,
    });
    const firstClip = result?.clips?.[0];
    if (firstClip?.base64) {
      return `data:${firstClip.mimeType || "audio/mpeg"};base64,${firstClip.base64}`;
    }
    return null;
  } catch (error) {
    console.warn("Quran Audio Fetch Error:", error);
    return null;
  }
}

const ttsClientCache = new Map<string, string>();
let ttsClientQuotaCooldownUntil = 0;

export async function generateSpiritualAudio(
  text: string,
  type: 'verse' | 'reflection' = 'verse',
  voiceName?: string
): Promise<string | null> {
  const normalizedText = text.trim();
  if (!normalizedText) return null;

  if (isStaticHostWithoutBackend()) {
    return null;
  }

  const cacheKey = `${type}:${voiceName || 'default'}:${normalizedText}`;
  const cached = ttsClientCache.get(cacheKey);
  if (cached) return cached;

  // Bypass client-level quota cooldown whenever user has active personal keys configured
  const hasUserKeys = buildGeminiRequestContext().sentKeyIds.length > 0;
  if (!hasUserKeys && Date.now() < ttsClientQuotaCooldownUntil) {
    return null;
  }

  try {
    const response = await postGeminiApi("/api/gemini/tts", {
      text: normalizedText,
      type,
      voiceName,
    });

    if (!response.ok) {
      if (response.status === 429 && !hasUserKeys) {
        // Pause repeated TTS calls for 2 minutes on quota exhaustion so Quran recitation works seamlessly
        ttsClientQuotaCooldownUntil = Date.now() + 2 * 60 * 1000;
      }
      return null;
    }

    const data = await safeReadJson<{ audioUrl?: string }>(response);
    const audioUrl = data?.audioUrl || null;
    if (audioUrl) {
      if (ttsClientCache.size >= 30) {
        const oldestKey = ttsClientCache.keys().next().value;
        if (oldestKey) ttsClientCache.delete(oldestKey);
      }
      ttsClientCache.set(cacheKey, audioUrl);
    }
    return audioUrl;
  } catch {
    return null;
  }
}
