import {
  AspectRatio,
  GeneratedPost,
  fetchQuranRecitation,
  generateSpiritualAudio,
} from './geminiService';
import { getReciterById } from '../utils/quranData';
import {
  SupportingCitation,
  buildReflectionWithCitationSpeech,
  formatCitationForSpeech,
} from '../utils/categoryEditorial';
import {
  getApiUrl,
  isStaticHostWithoutBackend,
  markBackendUnavailableIfStatic,
  safeReadJson,
} from './apiEnvironment';

export type VideoAudioMode = 'verse' | 'full' | 'reflection';
export type VideoMotionStyle = 'kenburns' | 'waveform' | 'static';
export type VideoVisualLayout = 'simple-vertical' | 'verse-synced' | 'cinema' | 'match';
export type ReflectionRevealMode = 'sentences' | 'words' | 'none';

export interface AudioSegmentTimeline {
  verseStartSec: number;
  verseEndSec: number;
  reflectionStartSec: number;
  reflectionEndSec: number;
  hasReflectionAudio: boolean;
}

export interface SyncedSentenceCue {
  text: string;
  startSec: number;
  endSec: number;
}

export interface SyncedWordCue {
  word: string;
  startSec: number;
  endSec: number;
}

export interface SyncedWordChunk {
  words: SyncedWordCue[];
  startSec: number;
  endSec: number;
}

export interface SyncedReflectionPlan {
  sentences: SyncedSentenceCue[];
  wordChunks: SyncedWordChunk[];
  startSec: number;
  endSec: number;
}

export interface VideoRenderConfig {
  post: GeneratedPost;
  imageUrl: string;
  aspectRatio: AspectRatio;
  layoutTemplate: 'standard' | 'overlay' | 'card' | 'split';
  visualLayout: VideoVisualLayout;
  reflectionRevealMode?: ReflectionRevealMode;
  cardFrameStyle: 'clean' | 'gold-border';
  cardAccentColor: string;
  fontFamily: string;
  fontFamilyCss: string;
  fontSize: number;
  overlayOpacity: number;
  showTopic: boolean;
  showReflection?: boolean;
  showVersePrefix: boolean;
  showVerseText: boolean;
  showVerseReference: boolean;
  showVerseOnImage: boolean;
  pageSignature: string;
  reciterId: string;
  reciterLabel: string;
  showReciterCredit: boolean;
  isAuthenticQuran: boolean;
  surahBadge?: string;
  activeCitation?: SupportingCitation | null;
  showCitationInVideo?: boolean;
}

export interface PreparedStudioAudio {
  audioBuffer: AudioBuffer;
  wavBlob: Blob;
  wavBase64: string;
  wavObjectUrl: string;
  durationSec: number;
  isAuthenticQuran: boolean;
  reciterName: string;
  surahBadge?: string;
  sourceNote: string;
  timeline: AudioSegmentTimeline;
  reflectionSpokenText: string;
}

export function getVideoDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
  switch (aspectRatio) {
    case '9:16':
      return { width: 1080, height: 1920 };
    case '16:9':
      return { width: 1920, height: 1080 };
    case '3:4':
      return { width: 1080, height: 1440 };
    case '4:3':
      return { width: 1440, height: 1080 };
    case '1:1':
    default:
      return { width: 1080, height: 1080 };
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const clean = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryString = atob(clean);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...sub);
  }
  return btoa(binary);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function encodeAudioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
  // Mono 44.1kHz PCM halves upload payload size with zero quality loss for Quran recitation & voiceover
  const numChannels = 1;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : null;

  let offset = 44;
  for (let i = 0; i < length; i++) {
    const mixed = right ? (left[i] + right[i]) * 0.5 : left[i];
    const sample = Math.max(-1, Math.min(1, mixed));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function stitchAudioBuffers(
  ctx: AudioContext,
  segments: Array<{ buffer: AudioBuffer; pauseAfterSec: number }>,
  leadInSec = 0.45,
  outroSec = 1.1
): AudioBuffer {
  const targetRate = 44100;
  const leadSamples = Math.floor(leadInSec * targetRate);
  const outroSamples = Math.floor(outroSec * targetRate);

  // Resample each segment to targetRate stereo using simple linear interpolation when rates differ
  const resampled: Array<{ left: Float32Array; right: Float32Array; pauseSamples: number }> = [];
  let totalSamples = leadSamples + outroSamples;

  for (const seg of segments) {
    const src = seg.buffer;
    const srcLeft = src.getChannelData(0);
    const srcRight = src.numberOfChannels > 1 ? src.getChannelData(1) : srcLeft;
    const ratio = src.sampleRate / targetRate;
    const outLen = Math.max(1, Math.round(src.length / ratio));
    const left = new Float32Array(outLen);
    const right = new Float32Array(outLen);

    for (let i = 0; i < outLen; i++) {
      const srcIdx = i * ratio;
      const idx0 = Math.floor(srcIdx);
      const idx1 = Math.min(src.length - 1, idx0 + 1);
      const frac = srcIdx - idx0;
      left[i] = srcLeft[idx0] * (1 - frac) + srcLeft[idx1] * frac;
      right[i] = srcRight[idx0] * (1 - frac) + srcRight[idx1] * frac;
    }

    const pauseSamples = Math.floor(seg.pauseAfterSec * targetRate);
    resampled.push({ left, right, pauseSamples });
    totalSamples += outLen + pauseSamples;
  }

  // Enforce a minimum 4-second cinematic reel duration
  totalSamples = Math.max(totalSamples, targetRate * 4);

  const output = ctx.createBuffer(2, totalSamples, targetRate);
  const outL = output.getChannelData(0);
  const outR = output.getChannelData(1);

  let cursor = leadSamples;
  let peak = 0.001;

  for (const item of resampled) {
    for (let i = 0; i < item.left.length && cursor + i < totalSamples; i++) {
      const l = item.left[i];
      const r = item.right[i];
      outL[cursor + i] = l;
      outR[cursor + i] = r;
      const absMax = Math.max(Math.abs(l), Math.abs(r));
      if (absMax > peak) peak = absMax;
    }
    cursor += item.left.length + item.pauseSamples;
  }

  // Gentle studio mastering normalization + micro fade-in/fade-out to avoid clicks
  const gain = Math.min(1.35, 0.9 / peak);
  const fadeSamples = Math.min(Math.floor(targetRate * 0.08), totalSamples >> 2);
  for (let i = 0; i < totalSamples; i++) {
    let env = 1;
    if (i < fadeSamples) env = i / fadeSamples;
    else if (i > totalSamples - fadeSamples) env = (totalSamples - i) / fadeSamples;
    outL[i] = Math.max(-0.98, Math.min(0.98, outL[i] * gain * env));
    outR[i] = Math.max(-0.98, Math.min(0.98, outR[i] * gain * env));
  }

  return output;
}

export async function prepareStudioAudio(options: {
  post: GeneratedPost;
  reciterId: string;
  audioMode: VideoAudioMode;
  activeCitation?: SupportingCitation | null;
  includeReflectionInAudio?: boolean;
  includeCitationInAudio?: boolean;
  onStatus?: (msg: string) => void;
}): Promise<PreparedStudioAudio> {
  const {
    post,
    reciterId,
    audioMode,
    activeCitation = null,
    includeReflectionInAudio,
    includeCitationInAudio = true,
    onStatus,
  } = options;
  const reciter = getReciterById(reciterId);

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();

  try {
    const leadInSec = 0.45;
    const outroSec = 1.15;
    const segments: Array<{ buffer: AudioBuffer; pauseAfterSec: number; kind: 'verse' | 'reflection' }> = [];
    let isAuthenticQuran = false;
    let surahBadge: string | undefined;
    let sourceNote = '';
    let reflectionSpokenText = '';

    const hasVerseContent = Boolean(post.verseText?.trim());
    const baseReflection = (post.content?.trim() || post.topic?.trim() || '').trim();
    const hasCitationContent = Boolean(activeCitation?.text?.trim());

    const wantsVerse = (audioMode === 'verse' || audioMode === 'full') && hasVerseContent;
    const wantsReflectionText =
      typeof includeReflectionInAudio === 'boolean'
        ? includeReflectionInAudio && Boolean(baseReflection)
        : (audioMode === 'reflection' || audioMode === 'full') && Boolean(baseReflection);
    const wantsCitationText = Boolean(includeCitationInAudio && hasCitationContent);
    const wantsSpokenNarration = wantsReflectionText || wantsCitationText;

    if (wantsVerse) {
      onStatus?.(`جاري جلب التلاوة القرآنية بصوت ${reciter.shortName}...`);
      const quranResp = await fetchQuranRecitation({
        surahNumber: post.surahNumber,
        surahName: post.surahName,
        verseNumber: post.verseNumber,
        verseReference: post.verseReference,
        verseText: post.verseText,
        reciter: reciter.id,
      });

      if (quranResp?.resolved && quranResp.clips && quranResp.clips.length > 0) {
        isAuthenticQuran = true;
        surahBadge =
          quranResp.ayahEnd && quranResp.ayahStart && quranResp.ayahEnd > quranResp.ayahStart
            ? `سورة ${quranResp.surahNameAr} · الآيات ${quranResp.ayahStart}-${quranResp.ayahEnd}`
            : `سورة ${quranResp.surahNameAr} · آية ${quranResp.ayahStart}`;
        sourceNote = `تلاوة قرآنية أصلية بصوت ${quranResp.reciterName}`;

        for (let idx = 0; idx < quranResp.clips.length; idx++) {
          const clip = quranResp.clips[idx];
          const arrBuf = base64ToArrayBuffer(clip.base64);
          const decoded = await audioCtx.decodeAudioData(arrBuf.slice(0));
          segments.push({
            buffer: decoded,
            pauseAfterSec: idx < quranResp.clips.length - 1 ? 0.35 : wantsSpokenNarration ? 0.7 : 0,
            kind: 'verse',
          });
        }
      } else {
        // Graceful fallback to Gemini TTS when the quote is a Hadith, Dua, or custom text
        onStatus?.('جاري توليد إلقاء روحاني هادئ للنص المختار...');
        const versePromptText = `${post.versePrefix ? post.versePrefix + ' ' : ''}${post.verseText || ''}`.trim();
        const ttsUrl = await generateSpiritualAudio(versePromptText, 'verse', 'Charon');
        if (ttsUrl) {
          const decoded = await audioCtx.decodeAudioData(base64ToArrayBuffer(ttsUrl));
          segments.push({
            buffer: decoded,
            pauseAfterSec: wantsSpokenNarration ? 0.65 : 0,
            kind: 'verse',
          });
          sourceNote = 'إلقاء صوتي روحاني هادئ للنص';
        }
      }
    }

    if (wantsSpokenNarration) {
      // Build narration matching the user's independent Reflection & Supporting Citation switches
      const spokenText = wantsReflectionText
        ? buildReflectionWithCitationSpeech(baseReflection, activeCitation, wantsCitationText)
        : formatCitationForSpeech(activeCitation);

      if (spokenText) {
        onStatus?.(
          wantsReflectionText && wantsCitationText
            ? 'جاري توليد قراءة روحانية للخاطرة والشاهد الداعم...'
            : wantsReflectionText
            ? 'جاري توليد قراءة روحانية للخاطرة الإيمانية...'
            : 'جاري توليد قراءة روحانية للشاهد الداعم...'
        );
        const ttsUrl = await generateSpiritualAudio(spokenText, 'reflection', 'Kore');
        if (ttsUrl) {
          const decoded = await audioCtx.decodeAudioData(base64ToArrayBuffer(ttsUrl));
          segments.push({ buffer: decoded, pauseAfterSec: 0, kind: 'reflection' });
          reflectionSpokenText = spokenText;
          const narrationLabel =
            wantsReflectionText && wantsCitationText
              ? 'قراءة الخاطرة والشاهد'
              : wantsReflectionText
              ? 'قراءة صوتية للخاطرة'
              : 'قراءة الشاهد الداعم';
          sourceNote = isAuthenticQuran
            ? `${sourceNote} + ${narrationLabel}`
            : `إلقاء صوتي روحاني (${narrationLabel})`;
        }
      }
    }

    // If neither produced audio yet (e.g., verse-only mode on a post with no verse), read the post content
    if (segments.length === 0) {
      const baseFallback = (post.content?.trim() || post.topic?.trim() || post.verseText?.trim() || '').trim();
      const willSpeakCitation = Boolean(includeCitationInAudio && hasCitationContent);
      const fallbackText = buildReflectionWithCitationSpeech(
        baseFallback,
        activeCitation,
        willSpeakCitation
      );
      if (!fallbackText) {
        throw new Error('لا يوجد نص أو آية لتوليد الصوت.');
      }
      onStatus?.('جاري تجهيز الإلقاء الصوتي للمنشور...');
      const ttsUrl = await generateSpiritualAudio(fallbackText, 'reflection', 'Charon');
      if (!ttsUrl) {
        throw new Error(
          'تم بلوغ الحد اليومي المجاني للقراءة الصوتية بالذكاء الاصطناعي. يمكنك إضافة مفتاح Gemini خاص بك من زر «الإعدادات» أو اختيار وضع «تلاوة الآية فقط» للاستمتاع بتلاوة القراء الستة بلا حدود.'
        );
      }
      const decoded = await audioCtx.decodeAudioData(base64ToArrayBuffer(ttsUrl));
      segments.push({ buffer: decoded, pauseAfterSec: 0, kind: 'reflection' });
      reflectionSpokenText = fallbackText;
      sourceNote = willSpeakCitation ? 'إلقاء صوتي روحاني للخاطرة والشاهد' : 'إلقاء صوتي روحاني هادئ';
    }

    // Calculate exact segment timeline timestamps matching stitchAudioBuffers cursor math
    let cursorSec = leadInSec;
    let verseStartSec = 0;
    let verseEndSec = 0;
    let reflectionStartSec = 0;
    let reflectionEndSec = 0;
    let hasVerseAudio = false;
    let hasReflectionAudio = false;

    for (const seg of segments) {
      const segDur = seg.buffer.duration;
      if (seg.kind === 'verse') {
        if (!hasVerseAudio) {
          verseStartSec = cursorSec;
          hasVerseAudio = true;
        }
        verseEndSec = cursorSec + segDur;
      } else {
        if (!hasReflectionAudio) {
          reflectionStartSec = cursorSec;
          hasReflectionAudio = true;
        }
        reflectionEndSec = cursorSec + segDur;
      }
      cursorSec += segDur + seg.pauseAfterSec;
    }

    onStatus?.('جاري موازنة الصوت بجودة استوديو (44.1kHz)...');
    const mastered = stitchAudioBuffers(audioCtx, segments, leadInSec, outroSec);
    const wavArrayBuffer = encodeAudioBufferToWav(mastered);
    const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
    const wavBase64 = arrayBufferToBase64(wavArrayBuffer);
    const wavObjectUrl = URL.createObjectURL(wavBlob);

    return {
      audioBuffer: mastered,
      wavBlob,
      wavBase64,
      wavObjectUrl,
      durationSec: mastered.duration,
      isAuthenticQuran,
      reciterName: isAuthenticQuran ? reciter.name : 'صوت نور الروحاني',
      surahBadge,
      sourceNote,
      timeline: {
        verseStartSec,
        verseEndSec,
        reflectionStartSec,
        reflectionEndSec,
        hasReflectionAudio,
      },
      reflectionSpokenText,
    };
  } finally {
    await audioCtx.close().catch(() => {});
  }
}

export function buildSyncedReflectionPlan(
  rawText: string,
  startSec: number,
  endSec: number
): SyncedReflectionPlan | null {
  // Strip decorative emojis for clean subtitle timing & typography while keeping Arabic diacritics & punctuation
  const cleaned = rawText
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || endSec <= startSec + 0.2) return null;

  const totalDur = endSec - startSec;

  // 1. Build natural Arabic sentences/phrases (concise 1-2 line subtitle segments)
  const roughParts = cleaned
    .split(/(?<=[.!؟؛\n])\s+|(?<=،)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const sentenceTexts: string[] = [];
  for (const part of roughParts) {
    const words = part.split(/\s+/).filter(Boolean);
    if (words.length <= 10) {
      // Merge tiny 1-2 word orphan fragments with previous sentence if short enough
      if (words.length <= 2 && sentenceTexts.length > 0 && sentenceTexts[sentenceTexts.length - 1].length < 48) {
        sentenceTexts[sentenceTexts.length - 1] = `${sentenceTexts[sentenceTexts.length - 1]} ${part}`;
      } else {
        sentenceTexts.push(part);
      }
    } else {
      // Split long sentences evenly into 7-9 word phrases so text never crowds the image
      const chunkCount = Math.ceil(words.length / 8);
      const perChunk = Math.ceil(words.length / chunkCount);
      for (let i = 0; i < words.length; i += perChunk) {
        sentenceTexts.push(words.slice(i, i + perChunk).join(' '));
      }
    }
  }

  const getSpeechWeight = (str: string) => {
    const baseChars = str.replace(/[\u064B-\u065F\u0670]/g, '').length;
    const pauseBonus = /[.!؟؛]$/.test(str) ? 6 : /،$/.test(str) ? 3 : 0;
    return Math.max(3, baseChars + pauseBonus);
  };

  const totalSentWeight = sentenceTexts.reduce((acc, s) => acc + getSpeechWeight(s), 0) || 1;
  let sCursor = startSec;
  const sentences: SyncedSentenceCue[] = sentenceTexts.map((text, idx) => {
    const dur =
      idx === sentenceTexts.length - 1
        ? Math.max(0.3, endSec - sCursor)
        : (getSpeechWeight(text) / totalSentWeight) * totalDur;
    const cue: SyncedSentenceCue = {
      text,
      startSec: sCursor,
      endSec: sCursor + dur,
    };
    sCursor += dur;
    return cue;
  });

  // 2. Build word-by-word cues grouped into tidy 5-word display windows
  const allWords = cleaned.split(/\s+/).filter(Boolean);
  const totalWordWeight = allWords.reduce((acc, w) => acc + getSpeechWeight(w), 0) || 1;
  let wCursor = startSec;
  const timedWords: SyncedWordCue[] = allWords.map((word, idx) => {
    const dur =
      idx === allWords.length - 1
        ? Math.max(0.12, endSec - wCursor)
        : (getSpeechWeight(word) / totalWordWeight) * totalDur;
    const cue: SyncedWordCue = {
      word,
      startSec: wCursor,
      endSec: wCursor + dur,
    };
    wCursor += dur;
    return cue;
  });

  const wordChunks: SyncedWordChunk[] = [];
  let currentWords: SyncedWordCue[] = [];
  for (let i = 0; i < timedWords.length; i++) {
    const item = timedWords[i];
    currentWords.push(item);
    const endsPunct = /[.!؟؛،]$/.test(item.word);
    if (
      currentWords.length >= 5 ||
      (endsPunct && currentWords.length >= 3) ||
      i === timedWords.length - 1
    ) {
      wordChunks.push({
        words: currentWords,
        startSec: currentWords[0].startSec,
        endSec: currentWords[currentWords.length - 1].endSec,
      });
      currentWords = [];
    }
  }

  return {
    sentences,
    wordChunks,
    startSec,
    endSec,
  };
}

export async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('تعذر تحميل صورة الخلفية بدقة كاملة'));
    img.src = src;
  });
}

async function ensureFontsReady(fontFamily: string) {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.all([
      document.fonts.load(`700 48px "${fontFamily}"`),
      document.fonts.load(`400 36px "${fontFamily}"`),
      document.fonts.load('700 48px "Amiri"'),
      document.fonts.ready,
    ]);
  } catch {
    await document.fonts.ready;
  }
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  zoom = 1,
  panX = 0,
  panY = 0
) {
  const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
  const boxRatio = dw / Math.max(1, dh);
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (imgRatio > boxRatio) {
    sw = img.naturalHeight * boxRatio;
  } else {
    sh = img.naturalWidth / boxRatio;
  }

  const zoomedW = sw / zoom;
  const zoomedH = sh / zoom;
  const maxOffsetX = (img.naturalWidth - zoomedW) / 2;
  const maxOffsetY = (img.naturalHeight - zoomedH) / 2;
  const sx = Math.max(0, Math.min(img.naturalWidth - zoomedW, maxOffsetX + panX * maxOffsetX));
  const sy = Math.max(0, Math.min(img.naturalHeight - zoomedH, maxOffsetY + panY * maxOffsetY));

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, zoomedW, zoomedH, dx, dy, dw, dh);
  ctx.restore();
}

function wrapArabicLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  if (!text.trim()) return [];
  const paragraphs = text.split(/\n+/);
  const allLines: string[] = [];

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = `${currentLine} ${words[i]}`;
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        allLines.push(currentLine);
        currentLine = words[i];
        if (allLines.length >= maxLines) break;
      }
    }
    if (allLines.length < maxLines) {
      allLines.push(currentLine);
    }
    if (allLines.length >= maxLines) break;
  }

  return allLines.slice(0, maxLines);
}

function drawGoldCornerOrnaments(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color = 'rgba(212, 175, 55, 0.72)'
) {
  const len = Math.min(w, h) * 0.065;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  const corners: Array<[number, number, number, number]> = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ];

  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * len, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * len);
    ctx.stroke();

    // Small diamond accent
    const mx = cx + dx * 16;
    const my = cy + dy * 16;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(mx, my - 5);
    ctx.lineTo(mx + 5, my);
    ctx.lineTo(mx, my + 5);
    ctx.lineTo(mx - 5, my);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export async function renderLayeredVideoCanvases(config: VideoRenderConfig): Promise<{
  width: number;
  height: number;
  bgCanvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
  imageEl: HTMLImageElement;
}> {
  const { width, height } = getVideoDimensions(config.aspectRatio);
  await ensureFontsReady(config.fontFamily);
  const imageEl = await loadImageElement(config.imageUrl);

  // 1. Background 1080p Canvas (pure cover-cropped artwork)
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = width;
  bgCanvas.height = height;
  const bgCtx = bgCanvas.getContext('2d')!;
  bgCtx.fillStyle = '#0c0c0d';
  bgCtx.fillRect(0, 0, width, height);
  drawImageCover(bgCtx, imageEl, 0, 0, width, height, 1);

  // 2. Transparent 1080p Overlay Canvas (razor-sharp Arabic calligraphy, frosted card, frame, signature)
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = width;
  overlayCanvas.height = height;
  const ctx = overlayCanvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const isPortrait = height > width;
  const isLandscape = width > height;

  if (config.visualLayout === 'simple-vertical') {
    renderSimpleVerticalVerseOverlay(ctx, width, height, config, isPortrait, isLandscape);
  } else if (config.visualLayout === 'verse-synced') {
    renderVerseOnlyOverlay(ctx, width, height, config, isPortrait, isLandscape);
  } else if (config.visualLayout === 'cinema' || config.layoutTemplate === 'overlay') {
    renderCinemaOverlay(ctx, width, height, config, isPortrait, isLandscape);
  } else {
    renderCardOverlay(ctx, width, height, config, isPortrait, isLandscape);
  }

  return { width, height, bgCanvas, overlayCanvas, imageEl };
}

function splitCitationForCanvas(
  ctx: CanvasRenderingContext2D,
  citation: SupportingCitation,
  maxWidth: number,
  maxLines = 3
): string[] {
  const clean = citation.text.trim();
  if (!clean) return [];
  if (citation.type === 'poetry' && clean.includes('/')) {
    const parts = clean
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      const lines: string[] = [];
      for (const hemistich of parts.slice(0, 2)) {
        lines.push(...wrapArabicLines(ctx, hemistich, maxWidth, 2));
      }
      return lines;
    }
  }
  return wrapArabicLines(ctx, clean, maxWidth, maxLines);
}

function drawDiamondDivider(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  spanWidth: number,
  color = 'rgba(212, 175, 55, 0.72)'
) {
  ctx.save();
  ctx.shadowBlur = 0;
  const half = spanWidth / 2;
  const grad = ctx.createLinearGradient(centerX - half, y, centerX + half, y);
  grad.addColorStop(0, 'rgba(212, 175, 55, 0)');
  grad.addColorStop(0.35, color);
  grad.addColorStop(0.65, color);
  grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(centerX - half, y);
  ctx.lineTo(centerX - 14, y);
  ctx.moveTo(centerX + 14, y);
  ctx.lineTo(centerX + half, y);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX, y - 5);
  ctx.lineTo(centerX + 6, y);
  ctx.lineTo(centerX, y + 5);
  ctx.lineTo(centerX - 6, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderCinemaOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: VideoRenderConfig,
  isPortrait: boolean,
  isLandscape: boolean
) {
  // Subtle cinematic gradient vignette so artwork breathes at the top while text shines crisply
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(6, 7, 9, 0.34)');
  grad.addColorStop(0.34, 'rgba(6, 7, 9, 0.14)');
  grad.addColorStop(0.66, `rgba(6, 7, 9, ${Math.min(0.76, config.overlayOpacity + 0.24)})`);
  grad.addColorStop(1, `rgba(6, 7, 9, ${Math.min(0.9, config.overlayOpacity + 0.44)})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Outer dignified double frame
  const outerInset = Math.round(Math.min(width, height) * 0.034);
  const frameRadius = 32;
  ctx.save();
  drawRoundedRectPath(
    ctx,
    outerInset,
    outerInset,
    width - outerInset * 2,
    height - outerInset * 2,
    frameRadius
  );
  ctx.strokeStyle =
    config.cardFrameStyle === 'gold-border'
      ? 'rgba(218, 182, 74, 0.82)'
      : 'rgba(255, 255, 255, 0.24)';
  ctx.lineWidth = config.cardFrameStyle === 'gold-border' ? 3.5 : 1.8;
  ctx.stroke();

  drawRoundedRectPath(
    ctx,
    outerInset + 10,
    outerInset + 10,
    width - (outerInset + 10) * 2,
    height - (outerInset + 10) * 2,
    frameRadius - 6
  );
  ctx.strokeStyle =
    config.cardFrameStyle === 'gold-border'
      ? 'rgba(218, 182, 74, 0.32)'
      : 'rgba(255, 255, 255, 0.10)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  if (config.cardFrameStyle === 'gold-border') {
    drawGoldCornerOrnaments(
      ctx,
      outerInset + 18,
      outerInset + 18,
      width - (outerInset + 18) * 2,
      height - (outerInset + 18) * 2
    );
  }
  ctx.restore();

  const scaleFactor = Math.min(width, height) / 1080;

  // Clean calligraphic top header (Surah or Category) — zero pill clutter
  const topLabel =
    config.surahBadge ||
    (config.post.category && config.post.category !== 'موضوع تلقائي' ? config.post.category : '');
  const topY = outerInset + (isPortrait ? 78 : 58);
  if (topLabel) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.78)';
    ctx.shadowBlur = 10;
    ctx.font = `700 ${Math.round((isPortrait ? 29 : 25) * scaleFactor)}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#F0D37A';
    ctx.fillText(`✦   ${topLabel}   ✦`, width / 2, topY);
    ctx.restore();
  }

  // Compute text content & measure vertical layout inside the lower-center frosted editorial card
  const panelMarginX = Math.round(width * (isLandscape ? 0.095 : 0.068));
  const panelWidth = width - panelMarginX * 2;
  const textMaxWidth = panelWidth - (isLandscape ? 116 : 84);

  const userVersePx = Math.max(30, Math.min(62, Math.round(config.fontSize * 1.55 * scaleFactor)));
  const titlePx = Math.round((isPortrait ? 48 : 42) * scaleFactor);
  const bodyPx = Math.round((isPortrait ? 33 : 29) * scaleFactor);
  const prefixPx = Math.round((isPortrait ? 26 : 23) * scaleFactor);
  const refPx = Math.round((isPortrait ? 24 : 21) * scaleFactor);
  const citLabelPx = Math.round((isPortrait ? 24 : 21) * scaleFactor);
  const citBodyPx = Math.round((isPortrait ? 29 : 26) * scaleFactor);
  const citSourcePx = Math.round((isPortrait ? 21 : 19) * scaleFactor);

  const hasTopic = config.showTopic && Boolean(config.post.topic?.trim());
  const hasContent = config.showReflection !== false && Boolean(config.post.content?.trim());
  const hasVerse = Boolean(config.post.verseText?.trim()) && config.showVerseText;
  const hasPrefix = hasVerse && config.showVersePrefix;
  const hasRef =
    Boolean(config.post.verseText?.trim()) &&
    config.showVerseReference &&
    Boolean(config.post.verseReference || config.post.surahName);
  const activeCitation =
    config.showCitationInVideo !== false && config.activeCitation?.text?.trim()
      ? config.activeCitation
      : null;

  // Smart multi-step auto-fit so long posts + verse + supporting citation NEVER clip
  const fitTypography = (shrink = 1) => {
    const tSize = Math.round(titlePx * shrink);
    const bSize = Math.round(bodyPx * shrink);
    const vSize = Math.round(userVersePx * shrink);
    const pSize = Math.round(prefixPx * shrink);
    const rSize = Math.round(refPx * shrink);
    const cLabelSize = Math.round(citLabelPx * shrink);
    const cBodySize = Math.round(citBodyPx * shrink);
    const cSourceSize = Math.round(citSourcePx * shrink);

    ctx.font = `700 ${tSize}px ${config.fontFamilyCss}`;
    const topicLines = hasTopic ? wrapArabicLines(ctx, config.post.topic, textMaxWidth, 2) : [];

    ctx.font = `500 ${bSize}px ${config.fontFamilyCss}`;
    const contentLines = hasContent
      ? wrapArabicLines(ctx, config.post.content, textMaxWidth, isPortrait ? 8 : 5)
      : [];

    ctx.font = `700 ${vSize}px ${config.fontFamilyCss}`;
    const formattedVerse = config.post.verseText
      ? `﴿ ${config.post.verseText.replace(/[﴿﴾]/g, '').trim()} ﴾`
      : '';
    const verseLines = hasVerse ? wrapArabicLines(ctx, formattedVerse, textMaxWidth - 36, 5) : [];

    ctx.font = `600 ${cBodySize}px ${config.fontFamilyCss}`;
    const citationLines = activeCitation
      ? splitCitationForCanvas(ctx, activeCitation, textMaxWidth - 20, isPortrait ? 3 : 2)
      : [];

    const verseBoxH =
      verseLines.length > 0
        ? Math.round(36 * shrink) +
          (hasPrefix ? pSize * 1.48 + Math.round(6 * shrink) : 0) +
          verseLines.length * (vSize * 1.56) +
          (hasRef ? rSize * 1.48 + Math.round(8 * shrink) : 0)
        : 0;

    const citationBlockH =
      activeCitation && citationLines.length > 0
        ? Math.round(28 * shrink) +
          cLabelSize * 1.48 +
          Math.round(6 * shrink) +
          citationLines.length * (cBodySize * 1.56) +
          (activeCitation.source ? cSourceSize * 1.42 + Math.round(6 * shrink) : 0)
        : 0;

    const totalH =
      (topicLines.length ? topicLines.length * (tSize * 1.38) + Math.round(24 * shrink) : 0) +
      (contentLines.length ? contentLines.length * (bSize * 1.58) + Math.round(24 * shrink) : 0) +
      (verseBoxH > 0 ? verseBoxH + Math.round(20 * shrink) : 0) +
      (citationBlockH > 0 ? citationBlockH + Math.round(14 * shrink) : 0) +
      (config.pageSignature.trim() || config.showReciterCredit ? 56 : 12);

    return {
      tSize,
      bSize,
      vSize,
      pSize,
      rSize,
      cLabelSize,
      cBodySize,
      cSourceSize,
      topicLines,
      contentLines,
      verseLines,
      citationLines,
      verseBoxH,
      citationBlockH,
      totalH,
      shrink,
    };
  };

  const maxAllowedPanelH = height * (isPortrait ? 0.72 : isLandscape ? 0.76 : 0.74);
  const scales = [1, 0.9, 0.82, 0.74, 0.66];
  let layout = fitTypography(scales[scales.length - 1]);
  for (const s of scales) {
    const attempt = fitTypography(s);
    layout = attempt;
    if (attempt.totalH + 92 <= maxAllowedPanelH) break;
  }

  const panelPadY = Math.round((isPortrait ? 46 : 36) * Math.max(0.8, layout.shrink));
  const panelHeight = Math.min(maxAllowedPanelH, layout.totalH + panelPadY * 2);
  const bottomSafeSpace = isPortrait ? 128 : 88;
  const panelY = Math.max(
    outerInset + (topLabel ? 112 : 56),
    height - bottomSafeSpace - panelHeight
  );

  // Draw refined frosted editorial card
  ctx.save();
  drawRoundedRectPath(ctx, panelMarginX, panelY, panelWidth, panelHeight, 32);
  const cardAlpha = Math.max(0.52, Math.min(0.86, config.overlayOpacity + 0.18));
  ctx.fillStyle = `rgba(9, 11, 15, ${cardAlpha.toFixed(2)})`;
  ctx.fill();
  ctx.strokeStyle =
    config.cardFrameStyle === 'gold-border'
      ? 'rgba(224, 188, 82, 0.56)'
      : 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Render razor-sharp centered Arabic typography
  let cursorY = panelY + panelPadY;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;

  // Topic Title
  if (layout.topicLines.length > 0) {
    ctx.font = `700 ${layout.tSize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#F0D37A';
    for (const line of layout.topicLines) {
      cursorY += layout.tSize * 0.68;
      ctx.fillText(line, width / 2, cursorY);
      cursorY += layout.tSize * 0.7;
    }
    cursorY += 4;
    drawDiamondDivider(ctx, width / 2, cursorY, Math.min(220, textMaxWidth * 0.32), 'rgba(230, 198, 106, 0.68)');
    cursorY += Math.round(18 * layout.shrink);
  }

  // Body Reflection Content
  if (layout.contentLines.length > 0) {
    ctx.font = `500 ${layout.bSize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    for (const line of layout.contentLines) {
      cursorY += layout.bSize * 0.78;
      ctx.fillText(line, width / 2, cursorY);
      cursorY += layout.bSize * 0.8;
    }
    cursorY += Math.round(16 * layout.shrink);
  }

  // Quranic Verse Medallion Box
  if (layout.verseLines.length > 0) {
    const vBoxW = textMaxWidth;
    const vBoxX = (width - vBoxW) / 2;
    ctx.save();
    ctx.shadowBlur = 0;
    drawRoundedRectPath(ctx, vBoxX, cursorY, vBoxW, layout.verseBoxH, 22);
    ctx.fillStyle = 'rgba(212, 175, 55, 0.085)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 198, 106, 0.36)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    let vy = cursorY + Math.round(18 * layout.shrink);
    if (hasPrefix) {
      ctx.font = `700 ${layout.pSize}px ${config.fontFamilyCss}`;
      ctx.fillStyle = '#E8CC75';
      vy += layout.pSize * 0.68;
      ctx.fillText(config.post.versePrefix || 'قال تعالى:', width / 2, vy);
      vy += layout.pSize * 0.8 + Math.round(4 * layout.shrink);
    }

    ctx.font = `700 ${layout.vSize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 14;
    for (const line of layout.verseLines) {
      vy += layout.vSize * 0.76;
      ctx.fillText(line, width / 2, vy);
      vy += layout.vSize * 0.8;
    }

    if (hasRef) {
      const refText =
        config.post.verseReference ||
        (config.post.surahName ? `(${config.post.surahName} : ${config.post.verseNumber || ''})` : '');
      if (refText) {
        ctx.font = `600 ${layout.rSize}px ${config.fontFamilyCss}`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.76)';
        vy += Math.round(6 * layout.shrink) + layout.rSize * 0.68;
        ctx.fillText(refText, width / 2, vy);
      }
    }

    cursorY += layout.verseBoxH + Math.round(18 * layout.shrink);
  }

  // Supporting Citation (Hadith · Two-Hemistich Poetry · Islamic Wisdom)
  if (activeCitation && layout.citationLines.length > 0) {
    drawDiamondDivider(ctx, width / 2, cursorY, Math.min(250, textMaxWidth * 0.38), 'rgba(230, 198, 106, 0.52)');
    cursorY += Math.round(20 * layout.shrink);

    const citHeading = activeCitation.prefix
      ? `${activeCitation.label}  ·  ${activeCitation.prefix}`
      : activeCitation.label;
    ctx.font = `700 ${layout.cLabelSize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#E8CC75';
    cursorY += layout.cLabelSize * 0.68;
    ctx.fillText(citHeading, width / 2, cursorY);
    cursorY += layout.cLabelSize * 0.76 + Math.round(6 * layout.shrink);

    ctx.font = `600 ${layout.cBodySize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    for (const line of layout.citationLines) {
      cursorY += layout.cBodySize * 0.76;
      ctx.fillText(line, width / 2, cursorY);
      cursorY += layout.cBodySize * 0.8;
    }

    if (activeCitation.source) {
      ctx.font = `600 ${layout.cSourceSize}px ${config.fontFamilyCss}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';
      cursorY += Math.round(6 * layout.shrink) + layout.cSourceSize * 0.68;
      ctx.fillText(activeCitation.source, width / 2, cursorY);
    }
  }

  // Footer Attribution (Reciter + Page Signature)
  const footerParts: string[] = [];
  if (config.showReciterCredit && config.reciterLabel) {
    footerParts.push(config.isAuthenticQuran ? `تلاوة: ${config.reciterLabel}` : config.reciterLabel);
  }
  if (config.pageSignature.trim()) {
    footerParts.push(config.pageSignature.trim());
  }

  if (footerParts.length > 0) {
    const footerY = panelY + panelHeight - 28;
    ctx.shadowBlur = 6;
    ctx.font = `700 ${Math.round(22 * scaleFactor)}px ${config.fontFamilyCss}`;
    ctx.fillStyle = 'rgba(240, 211, 122, 0.92)';
    ctx.fillText(footerParts.join('  •  '), width / 2, footerY);
  }

  ctx.restore();
}

function renderCardOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: VideoRenderConfig,
  isPortrait: boolean,
  isLandscape: boolean
) {
  // Paper panel below artwork (standard / card / split) while leaving top artwork window transparent so Ken Burns shines!
  const isSplitHorizontal = config.layoutTemplate === 'split' && (isLandscape || width === height);
  const paperBg = '#FAF7F1';
  const scaleFactor = Math.min(width, height) / 1080;

  let textX = 0;
  let textY = 0;
  let textW = width;
  let textH = height;

  if (isSplitHorizontal) {
    const artW = Math.round(width * 0.45);
    textX = artW;
    textY = 0;
    textW = width - artW;
    textH = height;

    ctx.fillStyle = paperBg;
    ctx.fillRect(textX, textY, textW, textH);

    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(artW - 2, 0, 4, height);
  } else {
    const artH = Math.round(height * (isPortrait ? 0.36 : 0.38));
    textX = 0;
    textY = artH;
    textW = width;
    textH = height - artH;

    // Subtle bottom fade inside artwork window
    const artFade = ctx.createLinearGradient(0, artH - 160, 0, artH);
    artFade.addColorStop(0, 'rgba(0,0,0,0)');
    artFade.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = artFade;
    ctx.fillRect(0, artH - 160, width, 160);

    ctx.fillStyle = paperBg;
    ctx.fillRect(textX, textY, textW, textH);

    // Golden seam line + center medallion clasp
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(0, artH - 2, width, 4);

    ctx.save();
    ctx.fillStyle = paperBg;
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width / 2, artH - 16);
    ctx.lineTo(width / 2 + 16, artH);
    ctx.lineTo(width / 2, artH + 16);
    ctx.lineTo(width / 2 - 16, artH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Outer dignified border
  const inset = 22;
  ctx.save();
  drawRoundedRectPath(ctx, inset, inset, width - inset * 2, height - inset * 2, 24);
  ctx.strokeStyle =
    config.cardFrameStyle === 'gold-border'
      ? 'rgba(212, 175, 55, 0.85)'
      : 'rgba(181, 141, 46, 0.42)';
  ctx.lineWidth = config.cardFrameStyle === 'gold-border' ? 3.5 : 2;
  ctx.stroke();
  ctx.restore();

  const centerX = textX + textW / 2;
  const maxTextW = textW - Math.round(112 * scaleFactor);
  const activeCitation =
    config.showCitationInVideo !== false && config.activeCitation?.text?.trim()
      ? config.activeCitation
      : null;

  const measureCard = (shrink: number) => {
    const titleSize = Math.round((isSplitHorizontal ? 38 : 42) * scaleFactor * shrink);
    const bodySize = Math.round((isSplitHorizontal ? 27 : 30) * scaleFactor * shrink);
    const verseSize = Math.round(Math.max(26, Math.min(44, config.fontSize * 1.35)) * scaleFactor * shrink);
    const prefixSize = Math.round(23 * scaleFactor * shrink);
    const refSize = Math.round(21 * scaleFactor * shrink);
    const cLabelSize = Math.round(22 * scaleFactor * shrink);
    const cBodySize = Math.round(26 * scaleFactor * shrink);
    const cSourceSize = Math.round(19 * scaleFactor * shrink);

    ctx.font = `700 ${titleSize}px ${config.fontFamilyCss}`;
    const topicLines = config.showTopic && config.post.topic ? wrapArabicLines(ctx, config.post.topic, maxTextW, 2) : [];

    ctx.font = `500 ${bodySize}px ${config.fontFamilyCss}`;
    const contentLines =
      config.showReflection !== false && config.post.content
        ? wrapArabicLines(ctx, config.post.content, maxTextW, 6)
        : [];

    ctx.font = `700 ${verseSize}px ${config.fontFamilyCss}`;
    const formattedVerse = config.post.verseText
      ? `﴿ ${config.post.verseText.replace(/[﴿﴾]/g, '').trim()} ﴾`
      : '';
    const verseLines = config.showVerseText && formattedVerse ? wrapArabicLines(ctx, formattedVerse, maxTextW - 32, 4) : [];

    ctx.font = `600 ${cBodySize}px ${config.fontFamilyCss}`;
    const citationLines = activeCitation
      ? splitCitationForCanvas(ctx, activeCitation, maxTextW - 18, 3)
      : [];

    const hasPrefix = verseLines.length > 0 && config.showVersePrefix;
    const hasRef =
      verseLines.length > 0 &&
      config.showVerseReference &&
      Boolean(config.post.verseReference || config.post.surahName);

    const verseBoxH =
      verseLines.length > 0
        ? Math.round(32 * shrink) +
          (hasPrefix ? prefixSize * 1.48 + 4 : 0) +
          verseLines.length * (verseSize * 1.54) +
          (hasRef ? refSize * 1.45 + 6 : 0)
        : 0;

    const citationH =
      activeCitation && citationLines.length > 0
        ? Math.round(24 * shrink) +
          cLabelSize * 1.45 +
          6 +
          citationLines.length * (cBodySize * 1.54) +
          (activeCitation.source ? cSourceSize * 1.42 + 6 : 0)
        : 0;

    const totalH =
      (topicLines.length ? topicLines.length * (titleSize * 1.38) + Math.round(22 * shrink) : 0) +
      (contentLines.length ? contentLines.length * (bodySize * 1.56) + Math.round(20 * shrink) : 0) +
      (verseBoxH > 0 ? verseBoxH + Math.round(18 * shrink) : 0) +
      (citationH > 0 ? citationH + Math.round(12 * shrink) : 0);

    return {
      titleSize,
      bodySize,
      verseSize,
      prefixSize,
      refSize,
      cLabelSize,
      cBodySize,
      cSourceSize,
      topicLines,
      contentLines,
      verseLines,
      citationLines,
      hasPrefix,
      hasRef,
      verseBoxH,
      citationH,
      totalH,
      shrink,
    };
  };

  const availableH = textH - 120;
  const scales = [1, 0.9, 0.82, 0.74, 0.66];
  let layout = measureCard(scales[scales.length - 1]);
  for (const s of scales) {
    const attempt = measureCard(s);
    layout = attempt;
    if (attempt.totalH <= availableH) break;
  }

  let cursorY = textY + Math.max(42, (textH - 54 - layout.totalH) / 2);

  if (layout.topicLines.length > 0) {
    ctx.font = `700 ${layout.titleSize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = config.cardAccentColor || '#5A5A40';
    for (const line of layout.topicLines) {
      cursorY += layout.titleSize * 0.68;
      ctx.fillText(line, centerX, cursorY);
      cursorY += layout.titleSize * 0.7;
    }
    cursorY += 4;
    drawDiamondDivider(ctx, centerX, cursorY, Math.min(200, maxTextW * 0.3), 'rgba(181, 141, 46, 0.55)');
    cursorY += Math.round(16 * layout.shrink);
  }

  if (layout.contentLines.length > 0) {
    ctx.font = `500 ${layout.bodySize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#25221D';
    for (const line of layout.contentLines) {
      cursorY += layout.bodySize * 0.76;
      ctx.fillText(line, centerX, cursorY);
      cursorY += layout.bodySize * 0.8;
    }
    cursorY += Math.round(16 * layout.shrink);
  }

  if (layout.verseLines.length > 0) {
    const vBoxW = maxTextW;
    const vBoxX = centerX - vBoxW / 2;
    ctx.save();
    drawRoundedRectPath(ctx, vBoxX, cursorY, vBoxW, layout.verseBoxH, 20);
    ctx.fillStyle = 'rgba(181, 141, 46, 0.075)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(181, 141, 46, 0.34)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    let vy = cursorY + Math.round(16 * layout.shrink);
    if (layout.hasPrefix) {
      ctx.font = `700 ${layout.prefixSize}px ${config.fontFamilyCss}`;
      ctx.fillStyle = config.cardAccentColor || '#5A5A40';
      vy += layout.prefixSize * 0.68;
      ctx.fillText(config.post.versePrefix || 'قال تعالى:', centerX, vy);
      vy += layout.prefixSize * 0.8 + 4;
    }

    ctx.font = `700 ${layout.verseSize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#151310';
    for (const line of layout.verseLines) {
      vy += layout.verseSize * 0.75;
      ctx.fillText(line, centerX, vy);
      vy += layout.verseSize * 0.79;
    }

    if (layout.hasRef) {
      const refText =
        config.post.verseReference ||
        (config.post.surahName ? `(${config.post.surahName} : ${config.post.verseNumber || ''})` : '');
      ctx.font = `600 ${layout.refSize}px ${config.fontFamilyCss}`;
      ctx.fillStyle = '#6B655B';
      vy += 6 + layout.refSize * 0.68;
      ctx.fillText(refText, centerX, vy);
    }

    cursorY += layout.verseBoxH + Math.round(16 * layout.shrink);
  }

  if (activeCitation && layout.citationLines.length > 0) {
    drawDiamondDivider(ctx, centerX, cursorY, Math.min(230, maxTextW * 0.35), 'rgba(181, 141, 46, 0.45)');
    cursorY += Math.round(18 * layout.shrink);

    const citHeading = activeCitation.prefix
      ? `${activeCitation.label}  ·  ${activeCitation.prefix}`
      : activeCitation.label;
    ctx.font = `700 ${layout.cLabelSize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#9A7426';
    cursorY += layout.cLabelSize * 0.68;
    ctx.fillText(citHeading, centerX, cursorY);
    cursorY += layout.cLabelSize * 0.76 + 6;

    ctx.font = `600 ${layout.cBodySize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#24201A';
    for (const line of layout.citationLines) {
      cursorY += layout.cBodySize * 0.75;
      ctx.fillText(line, centerX, cursorY);
      cursorY += layout.cBodySize * 0.79;
    }

    if (activeCitation.source) {
      ctx.font = `600 ${layout.cSourceSize}px ${config.fontFamilyCss}`;
      ctx.fillStyle = '#6B655B';
      cursorY += 6 + layout.cSourceSize * 0.68;
      ctx.fillText(activeCitation.source, centerX, cursorY);
    }
  }

  const footerParts: string[] = [];
  if (config.showReciterCredit && config.reciterLabel) {
    footerParts.push(config.isAuthenticQuran ? `تلاوة: ${config.reciterLabel}` : config.reciterLabel);
  }
  if (config.pageSignature.trim()) {
    footerParts.push(config.pageSignature.trim());
  }
  if (footerParts.length > 0) {
    ctx.font = `700 ${Math.round(21 * scaleFactor)}px ${config.fontFamilyCss}`;
    ctx.fillStyle = config.cardAccentColor || '#5A5A40';
    ctx.fillText(footerParts.join('  •  '), centerX, textY + textH - 36);
  }
}

function renderVerseOnlyOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: VideoRenderConfig,
  isPortrait: boolean,
  isLandscape: boolean
) {
  // Luminous, uncluttered gallery vignette that lets the artwork breathe while giving Quranic verse royal legibility
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(6, 7, 9, 0.38)');
  grad.addColorStop(0.28, 'rgba(6, 7, 9, 0.14)');
  grad.addColorStop(0.62, 'rgba(6, 7, 9, 0.24)');
  grad.addColorStop(1, 'rgba(6, 7, 9, 0.74)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const outerInset = Math.round(Math.min(width, height) * 0.034);
  ctx.save();
  drawRoundedRectPath(
    ctx,
    outerInset,
    outerInset,
    width - outerInset * 2,
    height - outerInset * 2,
    32
  );
  ctx.strokeStyle =
    config.cardFrameStyle === 'gold-border'
      ? 'rgba(218, 182, 74, 0.80)'
      : 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = config.cardFrameStyle === 'gold-border' ? 3.5 : 1.8;
  ctx.stroke();

  if (config.cardFrameStyle === 'gold-border') {
    drawGoldCornerOrnaments(
      ctx,
      outerInset + 18,
      outerInset + 18,
      width - (outerInset + 18) * 2,
      height - (outerInset + 18) * 2
    );
  }
  ctx.restore();

  const scaleFactor = Math.min(width, height) / 1080;

  // Clean calligraphic top header (Surah / Category)
  const topLabel =
    config.surahBadge ||
    (config.post.category && config.post.category !== 'موضوع تلقائي' ? config.post.category : '');
  const topY = outerInset + (isPortrait ? 80 : 58);
  if (topLabel) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.78)';
    ctx.shadowBlur = 10;
    ctx.font = `700 ${Math.round((isPortrait ? 29 : 25) * scaleFactor)}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#F0D37A';
    ctx.fillText(`✦   ${topLabel}   ✦`, width / 2, topY);
    ctx.restore();
  }

  // Render Quranic Verse (plus optional supporting citation) cleanly in the upper-middle while leaving lower third open for voice-synced reflection captions
  const hasSyncedCaptions = config.reflectionRevealMode !== 'none';
  const hasVerse = Boolean(config.post.verseText?.trim());
  const displayMainText = hasVerse
    ? `﴿ ${config.post.verseText!.replace(/[﴿﴾]/g, '').trim()} ﴾`
    : config.post.topic || '';
  const activeCitation =
    config.showCitationInVideo !== false && config.activeCitation?.text?.trim()
      ? config.activeCitation
      : null;

  if (displayMainText) {
    const panelMarginX = Math.round(width * (isLandscape ? 0.11 : 0.072));
    const panelW = width - panelMarginX * 2;
    const textMaxW = panelW - Math.round((isLandscape ? 104 : 76) * scaleFactor);

    const baseVersePx = Math.max(34, Math.min(68, Math.round(config.fontSize * 1.75 * scaleFactor)));
    const prefixPx = Math.round((isPortrait ? 28 : 25) * scaleFactor);
    const refPx = Math.round((isPortrait ? 24 : 21) * scaleFactor);
    const citLabelPx = Math.round((isPortrait ? 23 : 20) * scaleFactor);
    const citBodyPx = Math.round((isPortrait ? 28 : 24) * scaleFactor);
    const citSourcePx = Math.round((isPortrait ? 20 : 18) * scaleFactor);

    const showPrefix = hasVerse && config.showVersePrefix;
    const refText =
      hasVerse && config.showVerseReference
        ? config.post.verseReference ||
          (config.post.surahName ? `(${config.post.surahName} : ${config.post.verseNumber || ''})` : '')
        : '';

    const measureVerseCard = (shrink: number) => {
      const vSize = Math.round(baseVersePx * shrink);
      const pSize = Math.round(prefixPx * shrink);
      const rSize = Math.round(refPx * shrink);
      const cLSize = Math.round(citLabelPx * shrink);
      const cBSize = Math.round(citBodyPx * shrink);
      const cSSize = Math.round(citSourcePx * shrink);

      ctx.font = `700 ${vSize}px ${config.fontFamilyCss}`;
      const verseLines = wrapArabicLines(ctx, displayMainText, textMaxW, 5);

      ctx.font = `600 ${cBSize}px ${config.fontFamilyCss}`;
      const citationLines = activeCitation
        ? splitCitationForCanvas(ctx, activeCitation, textMaxW - 14, 2)
        : [];

      const citH =
        activeCitation && citationLines.length > 0
          ? Math.round(28 * shrink) +
            cLSize * 1.45 +
            6 +
            citationLines.length * (cBSize * 1.54) +
            (activeCitation.source ? cSSize * 1.42 + 6 : 0)
          : 0;

      const blockH =
        (showPrefix ? pSize * 1.5 + 8 : 0) +
        verseLines.length * (vSize * 1.58) +
        (refText ? rSize * 1.5 + 10 : 0) +
        citH;

      return { vSize, pSize, rSize, cLSize, cBSize, cSSize, verseLines, citationLines, blockH, shrink };
    };

    const maxCardH = height * (hasSyncedCaptions ? (isPortrait ? 0.50 : 0.48) : 0.64);
    const scales = [1, 0.88, 0.78, 0.7];
    let fitted = measureVerseCard(scales[scales.length - 1]);
    for (const s of scales) {
      const attempt = measureVerseCard(s);
      fitted = attempt;
      if (attempt.blockH + 80 <= maxCardH) break;
    }

    const padY = Math.round((isPortrait ? 40 : 30) * Math.max(0.8, fitted.shrink));
    const cardH = Math.min(maxCardH, fitted.blockH + padY * 2);

    const centerAnchorY = hasSyncedCaptions
      ? height * (isPortrait ? 0.40 : isLandscape ? 0.40 : 0.40)
      : height * 0.51;
    const cardY = Math.max(
      outerInset + (topLabel ? 116 : 64),
      Math.round(centerAnchorY - cardH / 2)
    );

    ctx.save();
    drawRoundedRectPath(ctx, panelMarginX, cardY, panelW, cardH, 30);
    const subtleAlpha = Math.max(0.36, Math.min(0.70, config.overlayOpacity + 0.04));
    ctx.fillStyle = `rgba(8, 10, 14, ${subtleAlpha.toFixed(2)})`;
    ctx.fill();
    ctx.strokeStyle =
      config.cardFrameStyle === 'gold-border'
        ? 'rgba(224, 188, 82, 0.52)'
        : 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    let cursorY = cardY + padY;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 2;

    if (showPrefix) {
      ctx.font = `700 ${fitted.pSize}px ${config.fontFamilyCss}`;
      ctx.fillStyle = '#F0D37A';
      cursorY += fitted.pSize * 0.68;
      ctx.fillText(config.post.versePrefix || 'قال تعالى:', width / 2, cursorY);
      cursorY += fitted.pSize * 0.82 + 8;
    }

    ctx.font = `700 ${fitted.vSize}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 16;
    for (const line of fitted.verseLines) {
      cursorY += fitted.vSize * 0.76;
      ctx.fillText(line, width / 2, cursorY);
      cursorY += fitted.vSize * 0.82;
    }

    if (refText) {
      cursorY += 8;
      ctx.font = `600 ${fitted.rSize}px ${config.fontFamilyCss}`;
      ctx.fillStyle = 'rgba(240, 211, 122, 0.90)';
      ctx.shadowBlur = 8;
      cursorY += fitted.rSize * 0.68;
      ctx.fillText(refText, width / 2, cursorY);
      cursorY += fitted.rSize * 0.78;
    }

    if (activeCitation && fitted.citationLines.length > 0) {
      cursorY += Math.round(8 * fitted.shrink);
      drawDiamondDivider(ctx, width / 2, cursorY, Math.min(220, textMaxW * 0.34), 'rgba(230, 198, 106, 0.56)');
      cursorY += Math.round(18 * fitted.shrink);

      const citHeading = activeCitation.prefix
        ? `${activeCitation.label}  ·  ${activeCitation.prefix}`
        : activeCitation.label;
      ctx.font = `700 ${fitted.cLSize}px ${config.fontFamilyCss}`;
      ctx.fillStyle = '#E8CC75';
      cursorY += fitted.cLSize * 0.68;
      ctx.fillText(citHeading, width / 2, cursorY);
      cursorY += fitted.cLSize * 0.74 + 6;

      ctx.font = `600 ${fitted.cBSize}px ${config.fontFamilyCss}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      for (const line of fitted.citationLines) {
        cursorY += fitted.cBSize * 0.76;
        ctx.fillText(line, width / 2, cursorY);
        cursorY += fitted.cBSize * 0.78;
      }

      if (activeCitation.source) {
        ctx.font = `600 ${fitted.cSSize}px ${config.fontFamilyCss}`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        cursorY += 6 + fitted.cSSize * 0.66;
        ctx.fillText(activeCitation.source, width / 2, cursorY);
      }
    }

    ctx.restore();
  }

  // Minimalist Reciter & Page Signature neatly tucked near the bottom frame
  const footerParts: string[] = [];
  if (config.showReciterCredit && config.reciterLabel) {
    footerParts.push(config.isAuthenticQuran ? `تلاوة: ${config.reciterLabel}` : config.reciterLabel);
  }
  if (config.pageSignature.trim()) {
    footerParts.push(config.pageSignature.trim());
  }

  if (footerParts.length > 0) {
    const footerY = height - outerInset - (isPortrait ? 52 : 34);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 8;
    ctx.font = `700 ${Math.round(23 * scaleFactor)}px ${config.fontFamilyCss}`;
    ctx.fillStyle = 'rgba(240, 211, 122, 0.94)';
    ctx.fillText(footerParts.join('  •  '), width / 2, footerY);
    ctx.restore();
  }
}

function renderSimpleVerticalVerseOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: VideoRenderConfig,
  isPortrait: boolean,
  isLandscape: boolean
) {
  // Pure full-bleed photograph matching the post's clean on-image Quranic text look:
  // Zero borders, zero frosted boxes, zero header badges, zero reflection/citation overlays.
  const grad = ctx.createLinearGradient(0, height * 0.52, 0, height);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.22)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.62)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, height * 0.52, width, height * 0.48);

  const scaleFactor = Math.min(width, height) / 1080;
  const rawVerse = config.post.verseText?.trim() || '';
  const hasVerse = Boolean(rawVerse) && config.showVerseText;
  const displayVerse = hasVerse ? rawVerse : (!rawVerse && config.showTopic ? config.post.topic?.trim() || '' : '');
  const showPrefix = hasVerse && config.showVersePrefix;
  const prefixText = (config.post.versePrefix || 'قال تعالى:').trim();

  if (!displayVerse && !showPrefix) return;

  const sidePad = Math.round(width * (isLandscape ? 0.11 : 0.068));
  const textMaxW = width - sidePad * 2;
  const baseVersePx = Math.max(44, Math.min(78, Math.round(config.fontSize * 2.55 * scaleFactor)));
  const basePrefixPx = Math.max(28, Math.round(baseVersePx * 0.54));

  const fitSimpleText = (shrink: number) => {
    const vSize = Math.round(baseVersePx * shrink);
    const pSize = Math.round(basePrefixPx * shrink);
    ctx.font = `700 ${vSize}px ${config.fontFamilyCss}`;
    const verseLines = displayVerse ? wrapArabicLines(ctx, displayVerse, textMaxW, isPortrait ? 6 : 4) : [];
    const verseLineH = vSize * (displayVerse.length > 110 ? 1.56 : 1.48);
    const prefixH = showPrefix ? pSize * 1.45 + Math.round(18 * scaleFactor * shrink) : 0;
    const totalH = prefixH + verseLines.length * verseLineH;
    return { vSize, pSize, verseLines, verseLineH, prefixH, totalH };
  };

  const maxBlockH = height * (isPortrait ? 0.40 : 0.46);
  const scales = [1, 0.9, 0.82, 0.74, 0.66];
  let fitted = fitSimpleText(scales[scales.length - 1]);
  for (const s of scales) {
    const attempt = fitSimpleText(s);
    fitted = attempt;
    if (attempt.totalH <= maxBlockH) break;
  }

  // Optional whisper-subtle footer only when user explicitly toggled reciter credit or entered a signature
  const footerParts: string[] = [];
  if (config.showReciterCredit && config.reciterLabel) {
    footerParts.push(config.isAuthenticQuran ? `تلاوة: ${config.reciterLabel}` : config.reciterLabel);
  }
  if (config.pageSignature.trim()) {
    footerParts.push(config.pageSignature.trim());
  }

  const bottomPad = Math.round((isPortrait ? 84 : 56) * scaleFactor) + (footerParts.length > 0 ? Math.round(44 * scaleFactor) : 0);
  let cursorY = height - bottomPad - fitted.totalH;

  // Render crisp white Arabic calligraphy with solid black contour + deep drop shadow (matching post image look)
  const drawOutlinedLine = (text: string, y: number, fontStr: string, strokeW: number, shadowBlur: number) => {
    ctx.save();
    ctx.font = fontStr;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.92)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(4 * scaleFactor);
    ctx.strokeText(text, width / 2, y);

    ctx.shadowBlur = Math.round(shadowBlur * 0.45);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, width / 2, y);
    ctx.restore();
  };

  if (showPrefix && prefixText) {
    const py = cursorY + fitted.pSize * 0.65;
    drawOutlinedLine(
      prefixText,
      py,
      `700 ${fitted.pSize}px ${config.fontFamilyCss}`,
      Math.max(4, Math.round(fitted.pSize * 0.14)),
      Math.round(10 * scaleFactor)
    );
    cursorY += fitted.prefixH;
  }

  for (const line of fitted.verseLines) {
    const ly = cursorY + fitted.verseLineH * 0.5;
    drawOutlinedLine(
      line,
      ly,
      `700 ${fitted.vSize}px ${config.fontFamilyCss}`,
      Math.max(5, Math.round(fitted.vSize * 0.12)),
      Math.round(16 * scaleFactor)
    );
    cursorY += fitted.verseLineH;
  }

  if (footerParts.length > 0) {
    const footerY = height - Math.round((isPortrait ? 44 : 28) * scaleFactor);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 8;
    ctx.font = `700 ${Math.round(22 * scaleFactor)}px ${config.fontFamilyCss}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(footerParts.join('  •  '), width / 2, footerY);
    ctx.restore();
  }
}

interface LightParticle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  driftX: number;
  phase: number;
  alpha: number;
}

export function createGoldenParticles(count = 26): LightParticle[] {
  const list: LightParticle[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      x: ((i * 73 + 19) % 100) / 100,
      y: ((i * 41 + 7) % 100) / 100,
      radius: 2 + (i % 5) * 1.4,
      speedY: 0.015 + (i % 4) * 0.008,
      driftX: 0.008 + (i % 3) * 0.006,
      phase: i * 1.1,
      alpha: 0.22 + (i % 5) * 0.1,
    });
  }
  return list;
}

function drawSyncedReflectionCaption(params: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  elapsedSec: number;
  plan: SyncedReflectionPlan;
  mode: ReflectionRevealMode;
  fontFamilyCss: string;
  hasWaveform: boolean;
  previewSample?: boolean;
}) {
  const { ctx, width, height, elapsedSec, plan, mode, fontFamilyCss, hasWaveform, previewSample } = params;
  if (mode === 'none') return;

  const isPortrait = height > width;
  const isLandscape = width > height;
  const scaleFactor = Math.min(width, height) / 1080;

  // Position cleanly in the lower third without colliding with footer credit or waveform
  const bottomMargin = (isPortrait ? 185 : 125) + (hasWaveform ? 44 : 0);
  const boxMarginX = Math.round(width * (isLandscape ? 0.14 : 0.085));
  const boxW = width - boxMarginX * 2;
  const textMaxW = boxW - Math.round(80 * scaleFactor);

  if (mode === 'sentences') {
    let activeIdx = -1;
    if (previewSample) {
      activeIdx = 0;
    } else {
      activeIdx = plan.sentences.findIndex(
        (c, i) =>
          elapsedSec >= c.startSec - 0.05 &&
          elapsedSec <= c.endSec + (i === plan.sentences.length - 1 ? 0.75 : 0.04)
      );
    }
    if (activeIdx < 0) return;

    const cue = plan.sentences[activeIdx];
    const localT = previewSample ? 0.5 : Math.max(0, elapsedSec - cue.startSec);
    const rawEnter = Math.min(1, localT / 0.32);
    const enterEase = 1 - Math.pow(1 - rawEnter, 3);
    const exitAlpha = previewSample ? 1 : Math.min(1, Math.max(0, (cue.endSec + 0.16 - elapsedSec) / 0.24));
    const alpha = Math.max(0, Math.min(1, Math.min(enterEase, exitAlpha)));
    const glideY = (1 - enterEase) * 16 * scaleFactor;

    const fontPx = Math.round((isPortrait ? 39 : 35) * scaleFactor);
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${fontPx}px ${fontFamilyCss}`;

    const lines = wrapArabicLines(ctx, cue.text, textMaxW, 3);
    const lineH = fontPx * 1.62;
    const padY = Math.round(30 * scaleFactor);
    const dotsH = plan.sentences.length > 1 ? 24 * scaleFactor : 0;
    const boxH = lines.length * lineH + padY * 2 + dotsH;
    const boxY = height - bottomMargin - boxH + glideY;

    ctx.globalAlpha = alpha;
    drawRoundedRectPath(ctx, boxMarginX, boxY, boxW, boxH, 26 * scaleFactor);
    ctx.fillStyle = 'rgba(8, 10, 14, 0.78)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 188, 82, 0.48)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Subtle golden shimmer bar along top edge of subtitle card
    const topLineW = Math.min(180 * scaleFactor, boxW * 0.28);
    const topGrad = ctx.createLinearGradient(width / 2 - topLineW / 2, boxY, width / 2 + topLineW / 2, boxY);
    topGrad.addColorStop(0, 'rgba(230, 198, 106, 0)');
    topGrad.addColorStop(0.5, 'rgba(240, 211, 122, 0.92)');
    topGrad.addColorStop(1, 'rgba(230, 198, 106, 0)');
    ctx.strokeStyle = topGrad;
    ctx.lineWidth = 3 * scaleFactor;
    ctx.beginPath();
    ctx.moveTo(width / 2 - topLineW / 2, boxY + 1);
    ctx.lineTo(width / 2 + topLineW / 2, boxY + 1);
    ctx.stroke();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.82)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#FFFFFF';

    let cy = boxY + padY + lineH * 0.48;
    for (const line of lines) {
      ctx.fillText(line, width / 2, cy);
      cy += lineH;
    }

    // Subtle sentence progress dots
    if (plan.sentences.length > 1) {
      const maxDots = Math.min(plan.sentences.length, 12);
      const activeDot = Math.floor((activeIdx / Math.max(1, plan.sentences.length - 1)) * (maxDots - 1));
      const dotGap = 14 * scaleFactor;
      const totalDotsW = (maxDots - 1) * dotGap;
      const dotY = boxY + boxH - 16 * scaleFactor;
      ctx.shadowBlur = 0;
      for (let d = 0; d < maxDots; d++) {
        const dx = width / 2 + totalDotsW / 2 - d * dotGap;
        ctx.fillStyle = d === activeDot ? '#F0D37A' : 'rgba(255,255,255,0.28)';
        ctx.beginPath();
        ctx.arc(dx, dotY, (d === activeDot ? 4.4 : 2.6) * scaleFactor, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    return;
  }

  if (mode === 'words') {
    let chunkIdx = -1;
    if (previewSample) {
      chunkIdx = 0;
    } else {
      chunkIdx = plan.wordChunks.findIndex(
        (ch, i) =>
          elapsedSec >= ch.startSec - 0.05 &&
          elapsedSec <= ch.endSec + (i === plan.wordChunks.length - 1 ? 0.75 : 0.05)
      );
    }
    if (chunkIdx < 0) return;

    const chunk = plan.wordChunks[chunkIdx];
    const revealedIdx = previewSample
      ? Math.min(chunk.words.length - 1, 2)
      : chunk.words.reduce((best, w, i) => (elapsedSec >= w.startSec - 0.04 ? i : best), 0);

    const fontPx = Math.round((isPortrait ? 43 : 37) * scaleFactor);
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${fontPx}px ${fontFamilyCss}`;

    const spaceW = ctx.measureText(' ').width * 1.18;

    const lines: Array<Array<{ word: string; globalIdx: number; width: number }>> = [];
    let currentLine: Array<{ word: string; globalIdx: number; width: number }> = [];
    let currentLineW = 0;

    chunk.words.forEach((wc, idx) => {
      const wWidth = ctx.measureText(wc.word).width;
      if (currentLine.length > 0 && currentLineW + spaceW + wWidth > textMaxW) {
        lines.push(currentLine);
        currentLine = [{ word: wc.word, globalIdx: idx, width: wWidth }];
        currentLineW = wWidth;
      } else {
        currentLine.push({ word: wc.word, globalIdx: idx, width: wWidth });
        currentLineW += (currentLine.length > 1 ? spaceW : 0) + wWidth;
      }
    });
    if (currentLine.length > 0) lines.push(currentLine);

    const lineH = fontPx * 1.66;
    const padY = Math.round(30 * scaleFactor);
    const boxH = lines.length * lineH + padY * 2;
    const boxY = height - bottomMargin - boxH;

    drawRoundedRectPath(ctx, boxMarginX, boxY, boxW, boxH, 26 * scaleFactor);
    ctx.fillStyle = 'rgba(8, 10, 14, 0.78)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 188, 82, 0.48)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.textAlign = 'right';
    let cy = boxY + padY + lineH * 0.5;

    for (const line of lines) {
      const visibleWords = line.filter((item) => item.globalIdx <= revealedIdx);
      if (visibleWords.length === 0) {
        cy += lineH;
        continue;
      }
      const totalVisibleW =
        visibleWords.reduce((sum, item) => sum + item.width, 0) +
        Math.max(0, visibleWords.length - 1) * spaceW;

      let cursorX = width / 2 + totalVisibleW / 2;

      for (const item of visibleWords) {
        const isCurrent = item.globalIdx === revealedIdx;
        ctx.save();
        if (isCurrent) {
          ctx.fillStyle = '#F5D97E';
          ctx.shadowColor = 'rgba(212, 175, 55, 0.72)';
          ctx.shadowBlur = 18;
          ctx.fillText(item.word, cursorX, cy - 2 * scaleFactor);
          // Subtle golden underline accent beneath the actively spoken word
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(245, 217, 126, 0.85)';
          ctx.fillRect(cursorX - item.width, cy + fontPx * 0.54, item.width, 3 * scaleFactor);
        } else {
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.78)';
          ctx.shadowBlur = 8;
          ctx.fillText(item.word, cursorX, cy);
        }
        ctx.restore();
        cursorX -= item.width + spaceW;
      }
      cy += lineH;
    }

    ctx.restore();
  }
}

export function drawAnimatedVideoFrame(params: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  imageEl: HTMLImageElement;
  overlayCanvas: HTMLCanvasElement;
  elapsedSec: number;
  durationSec: number;
  motionStyle: VideoMotionStyle;
  particles: LightParticle[];
  frequencyData?: Uint8Array | null;
  showWaveform?: boolean;
  reflectionPlan?: SyncedReflectionPlan | null;
  reflectionRevealMode?: ReflectionRevealMode;
  fontFamilyCss?: string;
  previewSample?: boolean;
}) {
  const {
    ctx,
    width,
    height,
    imageEl,
    overlayCanvas,
    elapsedSec,
    durationSec,
    motionStyle,
    particles,
    frequencyData,
    showWaveform = true,
    reflectionPlan = null,
    reflectionRevealMode = 'none',
    fontFamilyCss = '"Amiri", serif',
    previewSample = false,
  } = params;

  const progress = Math.max(0, Math.min(1, elapsedSec / Math.max(0.1, durationSec)));

  // 1. Animated Ken Burns Background
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  if (motionStyle !== 'static') {
    const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    zoom = 1 + eased * 0.095;
    panX = Math.sin(progress * Math.PI) * 0.18;
    panY = (eased - 0.5) * 0.12;
  }

  ctx.clearRect(0, 0, width, height);
  drawImageCover(ctx, imageEl, 0, 0, width, height, zoom, panX, panY);

  // 2. Gentle Drifting Golden Light Motes (in waveform mode)
  if (motionStyle === 'waveform') {
    ctx.save();
    for (const p of particles) {
      const py = ((p.y - elapsedSec * p.speedY) % 1 + 1) % 1;
      const px = (p.x + Math.sin(elapsedSec * 0.8 + p.phase) * p.driftX + 1) % 1;
      const pulse = 0.55 + 0.45 * Math.sin(elapsedSec * 1.7 + p.phase);
      const x = px * width;
      const y = py * height;
      const r = p.radius * (Math.min(width, height) / 720);

      const radial = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
      radial.addColorStop(0, `rgba(246, 224, 146, ${(p.alpha * pulse).toFixed(3)})`);
      radial.addColorStop(0.5, `rgba(212, 175, 55, ${(p.alpha * 0.45 * pulse).toFixed(3)})`);
      radial.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Razor-sharp Pre-rendered 1080p Arabic Typography Overlay with smooth fade-in
  const fadeAlpha = previewSample ? 1 : Math.min(1, elapsedSec / 0.65);
  ctx.save();
  ctx.globalAlpha = fadeAlpha;
  ctx.drawImage(overlayCanvas, 0, 0, width, height);
  ctx.restore();

  // 4. Dynamic Voice-Synced Reflection Captions (Sentence-by-Sentence or Word-by-Word)
  if (reflectionPlan && reflectionRevealMode !== 'none') {
    drawSyncedReflectionCaption({
      ctx,
      width,
      height,
      elapsedSec,
      plan: reflectionPlan,
      mode: reflectionRevealMode,
      fontFamilyCss,
      hasWaveform: showWaveform && motionStyle === 'waveform',
      previewSample,
    });
  }

  // 5. Live Voice-Reactive Golden Waveform Bars (symmetric equalizer)
  if (showWaveform && motionStyle === 'waveform') {
    const barCount = 28;
    const totalWaveW = Math.min(width * 0.48, 440);
    const gap = 6;
    const barW = Math.max(4, (totalWaveW - gap * (barCount - 1)) / barCount);
    const startX = (width - totalWaveW) / 2;
    const baseY = height - (height > width ? 74 : 50);
    const maxBarH = height > width ? 42 : 34;

    ctx.save();
    for (let i = 0; i < barCount; i++) {
      const mirrorIdx = Math.abs(i - (barCount - 1) / 2);
      const centerWeight = 1 - mirrorIdx / (barCount / 2);
      let energy = 0.14;

      if (frequencyData && frequencyData.length > 0) {
        const bin = Math.min(
          frequencyData.length - 1,
          Math.floor(2 + (mirrorIdx / (barCount / 2)) * (frequencyData.length * 0.42))
        );
        energy = Math.max(0.12, (frequencyData[bin] / 255) * (0.55 + 0.65 * centerWeight));
      } else {
        energy = 0.16 + 0.14 * Math.abs(Math.sin(elapsedSec * 3.5 + i * 0.45)) * centerWeight;
      }

      const barH = Math.max(6, energy * maxBarH);
      const bx = startX + i * (barW + gap);
      const by = baseY - barH / 2;

      ctx.fillStyle = `rgba(232, 197, 91, ${(0.52 + energy * 0.48).toFixed(2)})`;
      drawRoundedRectPath(ctx, bx, by, barW, barH, barW / 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 6. Whisper-thin Golden Progress Ribbon at Bottom
  ctx.save();
  const barH = 5;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.fillRect(0, height - barH, width, barH);
  const progGrad = ctx.createLinearGradient(0, 0, width * progress, 0);
  progGrad.addColorStop(0, '#B8922E');
  progGrad.addColorStop(1, '#F5D97E');
  ctx.fillStyle = progGrad;
  ctx.fillRect(0, height - barH, width * progress, barH);
  ctx.restore();
}

export async function exportFastStudioMp4(params: {
  bgCanvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
  audio: PreparedStudioAudio;
  motionStyle: 'kenburns' | 'static';
  onStatus?: (msg: string, progress: number) => void;
}): Promise<Blob> {
  const { bgCanvas, overlayCanvas, audio, motionStyle, onStatus } = params;

  onStatus?.('جاري تجهيز طبقات التصميم بدقة عالية...', 25);
  const backgroundPngBase64 = bgCanvas.toDataURL('image/jpeg', 0.94);
  const overlayPngBase64 = overlayCanvas.toDataURL('image/png');

  onStatus?.('جاري دمج الفيديو عالي الجودة مع الصوت بصيغة MP4...', 55);
  const response = await fetch(getApiUrl('/api/video/render-mp4'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      backgroundPngBase64,
      overlayPngBase64,
      audioBase64: audio.wavBase64,
      audioMimeType: 'audio/wav',
      motionStyle,
      width: bgCanvas.width,
      height: bgCanvas.height,
      durationSec: audio.durationSec,
    }),
  });

  if (markBackendUnavailableIfStatic(response)) {
    throw new Error('خدمة تصدير الخادم غير متوفرة على الاستضافة الثابتة؛ يرجى استخدام التصدير المباشر من المتصفح.');
  }

  if (!response.ok) {
    const err = await safeReadJson<{ error?: string }>(response);
    throw new Error(err?.error || 'تعذر تصدير الفيديو حالياً.');
  }

  onStatus?.('اكتمل إنشاء الفيديو بنجاح!', 100);
  return await response.blob();
}

export async function exportAnimatedWaveformMp4(params: {
  width: number;
  height: number;
  imageEl: HTMLImageElement;
  overlayCanvas: HTMLCanvasElement;
  audio: PreparedStudioAudio;
  motionStyle?: VideoMotionStyle;
  reflectionPlan?: SyncedReflectionPlan | null;
  reflectionRevealMode?: ReflectionRevealMode;
  fontFamilyCss?: string;
  onStatus?: (msg: string, progress: number) => void;
}): Promise<Blob> {
  const {
    width,
    height,
    imageEl,
    overlayCanvas,
    audio,
    motionStyle = 'waveform',
    reflectionPlan = null,
    reflectionRevealMode = 'none',
    fontFamilyCss = '"Amiri", serif',
    onStatus,
  } = params;

  // Use crisp HD resolution (720p for tall/wide or 1080p for square) for smooth real-time 25-30fps capture
  const scale = Math.max(width, height) > 1280 ? 1280 / Math.max(width, height) : 1;
  const recW = Math.floor((width * scale) / 2) * 2;
  const recH = Math.floor((height * scale) / 2) * 2;

  const recCanvas = document.createElement('canvas');
  recCanvas.width = recW;
  recCanvas.height = recH;
  const ctx = recCanvas.getContext('2d')!;

  const particles = createGoldenParticles(28);
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();
  const source = audioCtx.createBufferSource();
  source.buffer = audio.audioBuffer;

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.78;
  const freqData = new Uint8Array(analyser.frequencyBinCount);

  const dest = audioCtx.createMediaStreamDestination();
  source.connect(analyser);
  analyser.connect(dest);

  const canvasStream = recCanvas.captureStream(25);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);

  const mimeCandidates = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const supportedMime = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';
  const recorder = new MediaRecorder(combinedStream, {
    ...(supportedMime ? { mimeType: supportedMime } : {}),
    videoBitsPerSecond: 6_500_000,
    audioBitsPerSecond: 192_000,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: supportedMime || 'video/webm' }));
    };
    recorder.onerror = () => reject(new Error('تعذر تسجيل الفيديو الحي في المتصفح.'));
  });

  const startTime = performance.now();
  const durationMs = audio.durationSec * 1000;
  let rafId = 0;

  const statusPrefix =
    reflectionRevealMode === 'words'
      ? 'جاري تصيير الخاطرة كلمة كلمة مع الصوت'
      : reflectionRevealMode === 'sentences'
      ? 'جاري تصيير الخاطرة جملة جملة مع الصوت'
      : 'جاري التصيير الحي للموجة الصوتية';

  onStatus?.(`${statusPrefix}...`, 10);
  recorder.start(250);
  source.start(0);

  const renderLoop = () => {
    const elapsedMs = performance.now() - startTime;
    const elapsedSec = Math.min(audio.durationSec, elapsedMs / 1000);
    analyser.getByteFrequencyData(freqData);

    drawAnimatedVideoFrame({
      ctx,
      width: recW,
      height: recH,
      imageEl,
      overlayCanvas,
      elapsedSec,
      durationSec: audio.durationSec,
      motionStyle,
      particles,
      frequencyData: freqData,
      showWaveform: motionStyle === 'waveform',
      reflectionPlan,
      reflectionRevealMode,
      fontFamilyCss,
    });

    const pct = Math.min(82, Math.round(10 + (elapsedMs / durationMs) * 72));
    onStatus?.(`${statusPrefix}... (${Math.min(100, Math.round((elapsedMs / durationMs) * 100))}%)`, pct);

    if (elapsedMs < durationMs + 120) {
      rafId = requestAnimationFrame(renderLoop);
    } else if (recorder.state === 'recording') {
      recorder.stop();
    }
  };

  rafId = requestAnimationFrame(renderLoop);

  const recordedBlob = await recordingPromise;
  cancelAnimationFrame(rafId);
  try {
    source.stop();
  } catch {}
  await audioCtx.close().catch(() => {});

  // If browser recorded WebM and a backend is available, seamlessly remux on server into universal H.264/AAC MP4!
  if (!recordedBlob.type.includes('mp4') && !isStaticHostWithoutBackend()) {
    onStatus?.('جاري تحويل الفيديو إلى صيغة MP4 متوافقة مع واتساب وجميع الأجهزة...', 88);
    try {
      const remuxResp = await fetch(getApiUrl('/api/video/remux-mp4'), {
        method: 'POST',
        headers: { 'Content-Type': 'video/webm' },
        body: recordedBlob,
      });
      if (!markBackendUnavailableIfStatic(remuxResp) && remuxResp.ok) {
        onStatus?.('تم تجهيز الفيديو بدقة عالية وصيغة MP4!', 100);
        return await remuxResp.blob();
      }
    } catch (remuxErr) {
      console.warn('Server remux failed, falling back to recorded video blob:', remuxErr);
    }
  }

  onStatus?.('تم تجهيز الفيديو بنجاح!', 100);
  return recordedBlob;
}
