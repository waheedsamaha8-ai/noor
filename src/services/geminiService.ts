import { getCategoryFallbackTopics, getLocalFallbackImage } from './localArchive';
import { SupportingCitation } from '../utils/categoryEditorial';
import {
  buildGeminiRequestContext,
  recordGeminiResponseRotation,
} from './aiKeyManager';

async function postGeminiApi(endpoint: string, payload: unknown): Promise<Response> {
  const { headers, sentKeyIds } = buildGeminiRequestContext();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
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
  } catch (e) {
    return null;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`noor_cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
};

const FALLBACK_TOPICS = [
  "فضل الصلاة على النبي ﷺ",
  "أهمية بر الوالدين في الإسلام",
  "قصة صبر النبي أيوب عليه السلام",
  "عظمة الاستغفار وأثره في الرزق",
  "كيفية تدبر القرآن الكريم"
];

const FALLBACK_DHIKR = "سبحان الله وبحمده، عدد خلقه، ورضا نفسه، وزنة عرشه، ومداد كلماته";

export async function generateReligiousContent(
  topic: string,
  tone: PostTone = "balanced",
  category: string = "موضوع تلقائي"
): Promise<GeneratedPost> {
  const response = await postGeminiApi("/api/gemini/content", { topic, tone, category });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "فشل في معالجة البيانات. يرجى المحاولة مرة أخرى.");
  }

  return data as GeneratedPost;
}

export async function generateReligiousImageWithMeta(
  prompt: string,
  aspectRatio: AspectRatio = "1:1",
  theme: Theme = "classic"
): Promise<GeneratedImageResult> {
  try {
    const response = await postGeminiApi("/api/gemini/image", { prompt, aspectRatio, theme });

    const data = await response.json();
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

  if (!forceRefresh) {
    const cached = getCache(cacheKey);
    if (Array.isArray(cached) && cached.length > 0) return cached;
  }

  try {
    const response = await postGeminiApi("/api/gemini/topics", { category });

    const data = await response.json();
    if (!response.ok) {
      if (forceRefresh && response.status === 429) {
        // Rotate fallback topics smoothly instead of throwing a disruptive crash banner
        const rotated = [...fallbackList].sort(() => Math.random() - 0.5);
        return rotated;
      }
      return fallbackList;
    }

    const topics = Array.isArray(data?.topics) && data.topics.length > 0 ? data.topics : fallbackList;
    setCache(cacheKey, topics);
    return topics;
  } catch (error: any) {
    console.warn("Suggestions fallback used:", error);
    return forceRefresh ? [...fallbackList].sort(() => Math.random() - 0.5) : fallbackList;
  }
}

export async function getDailyDhikr(): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const period = now.getHours() < 12 ? 'morning' : 'evening';
  const cacheKey = `daily_dhikr_${dateStr}_${period}`;

  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await postGeminiApi("/api/gemini/daily-dhikr", { period });

    if (!response.ok) {
      return FALLBACK_DHIKR;
    }

    const data = await response.json();
    const dhikr = data?.dhikr?.trim() || FALLBACK_DHIKR;
    setCache(cacheKey, dhikr);
    return dhikr;
  } catch (error) {
    console.warn("Daily dhikr fallback used:", error);
    return FALLBACK_DHIKR;
  }
}

export async function generateReligiousSeries(
  topic: string,
  count: number = 3,
  tone: PostTone = "balanced",
  category: string = "موضوع تلقائي"
): Promise<GeneratedPost[]> {
  const response = await postGeminiApi("/api/gemini/series", { topic, count, tone, category });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "فشل في توليد السلسلة.");
  }

  return Array.isArray(data?.posts) ? data.posts : [];
}

export async function refineReligiousContent(post: GeneratedPost, action: RefineAction): Promise<GeneratedPost> {
  const response = await postGeminiApi("/api/gemini/refine", { post, action });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "تعذر تحسين الصياغة حالياً.");
  }

  return data as GeneratedPost;
}

export async function fetchQuranRecitation(params: {
  surahNumber?: number;
  surahName?: string;
  verseNumber?: string;
  verseReference?: string;
  verseText?: string;
  reciter?: string;
}): Promise<QuranRecitationResponse | null> {
  try {
    const response = await fetch("/api/quran/recitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as QuranRecitationResponse;
  } catch (error) {
    console.warn("Quran Recitation Fetch Error:", error);
    return null;
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

    const data = await response.json();
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
