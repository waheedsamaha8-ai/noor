export interface QuranReciter {
  id: string;
  name: string;
  shortName: string;
  style: string;
  bitrateLabel: string;
}

export const QURAN_RECITERS: readonly QuranReciter[] = [
  {
    id: 'ar.alafasy',
    name: 'الشيخ مشاري راشد العفاسي',
    shortName: 'مشاري العفاسي',
    style: 'تلاوة عذبة ونقية ومحببة للقلوب',
    bitrateLabel: '128 kbps',
  },
  {
    id: 'ar.abdulbasitmurattal',
    name: 'الشيخ عبد الباسط عبد الصمد',
    shortName: 'عبد الباسط عبد الصمد',
    style: 'مرتّل · المدرسة المصرية الأصيلة',
    bitrateLabel: '192 kbps',
  },
  {
    id: 'ar.minshawi',
    name: 'الشيخ محمد صديق المنشاوي',
    shortName: 'محمد صديق المنشاوي',
    style: 'صوت خاشع ومؤثر يلامس الوجدان',
    bitrateLabel: '128 kbps',
  },
  {
    id: 'ar.husary',
    name: 'الشيخ محمود خليل الحصري',
    shortName: 'محمود خليل الحصري',
    style: 'أداء متقن ووقور بأحكام التجويد',
    bitrateLabel: '128 kbps',
  },
  {
    id: 'ar.mahermuaiqly',
    name: 'الشيخ ماهر المعيقلي',
    shortName: 'ماهر المعيقلي',
    style: 'تلاوة الحرم المكي الهادئة الصافية',
    bitrateLabel: '128 kbps',
  },
  {
    id: 'ar.saoodshuraym',
    name: 'الشيخ سعود الشريم',
    shortName: 'سعود الشريم',
    style: 'نبرة جليلة ومهيبة وسلسة',
    bitrateLabel: '64 kbps',
  },
] as const;

export type QuranReciterId = (typeof QURAN_RECITERS)[number]['id'];

export const ALLOWED_RECITER_IDS = new Set<string>(QURAN_RECITERS.map((r) => r.id));

export const getReciterById = (id?: string): QuranReciter => {
  return QURAN_RECITERS.find((r) => r.id === id) || QURAN_RECITERS[0];
};

// Complete 114 Surahs (1-indexed via array index + 1)
export const SURAH_NAMES_AR: readonly string[] = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
  'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
  'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
  'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
  'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
  'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
  'المسد', 'الإخلاص', 'الفلق', 'الناس',
];

const SURAH_ALIASES: Record<string, number> = {
  'الانشراح': 94,
  'الم نشرح': 94,
  'بني اسرائيل': 17,
  'المومن': 40,
  'المؤمن': 40,
  'اللهب': 111,
  'تبت': 111,
  'الدهر': 76,
  'براءة': 9,
  'التنزيل': 32,
  'الملائكة': 35,
  'ياسين': 36,
  'طه': 20,
  'اقرا': 96,
  'القيامه': 75,
  'التوبه': 9,
  'تبارك': 67,
  'عم': 78,
  'المجادله': 58,
  'الممتحنه': 60,
  'الجمعه': 62,
  'الواقعه': 56,
  'الحاقه': 69,
  'الزلزله': 99,
  'القارعه': 101,
  'الهمزه': 104,
  'البينه': 98,
  'الغاشيه': 88,
  'الجاثيه': 45,
  'المائده': 5,
  'البقره': 2,
  'الفاتحه': 1,
  'التحريم': 66,
  'ال عمران': 3,
  'الاعراف': 7,
  'الانعام': 6,
  'الانفال': 8,
  'الاسراء': 17,
  'الانبياء': 21,
  'الاحزاب': 33,
  'الاحقاف': 46,
  'الاعلى': 87,
  'الاخلاص': 112,
  'الانسان': 76,
  'ابراهيم': 14,
};

export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // strip tashkeel & quranic marks
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ـ/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeArabicDigits(text: string): string {
  return text
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

const NORMALIZED_SURAH_MAP = new Map<string, number>();
SURAH_NAMES_AR.forEach((name, idx) => {
  const num = idx + 1;
  const norm = normalizeArabic(name);
  NORMALIZED_SURAH_MAP.set(norm, num);
  if (norm.startsWith('ال')) {
    NORMALIZED_SURAH_MAP.set(norm.slice(2), num);
  }
});
Object.entries(SURAH_ALIASES).forEach(([alias, num]) => {
  const norm = normalizeArabic(alias);
  NORMALIZED_SURAH_MAP.set(norm, num);
  if (norm.startsWith('ال')) {
    NORMALIZED_SURAH_MAP.set(norm.slice(2), num);
  }
});

export function resolveSurahNumber(rawName?: string): number | null {
  if (!rawName) return null;
  let cleaned = normalizeArabic(normalizeArabicDigits(rawName));
  cleaned = cleaned
    .replace(/^سوره\s+/g, '')
    .replace(/^سورة\s+/g, '')
    .replace(/[()﴿﴾\[\]:،\-0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return null;

  const direct = NORMALIZED_SURAH_MAP.get(cleaned);
  if (direct) return direct;

  // Try matching longest known surah name contained inside cleaned string
  let bestMatch: { num: number; len: number } | null = null;
  for (const [key, num] of NORMALIZED_SURAH_MAP.entries()) {
    if (key.length >= 2 && cleaned.includes(key)) {
      if (!bestMatch || key.length > bestMatch.len) {
        bestMatch = { num, len: key.length };
      }
    }
  }
  return bestMatch ? bestMatch.num : null;
}

export interface ParsedQuranReference {
  surah: number;
  ayahStart: number;
  ayahEnd: number;
  surahNameAr: string;
}

export function parseQuranReference(input: {
  surahNumber?: number;
  surahName?: string;
  verseNumber?: string;
  verseReference?: string;
}): ParsedQuranReference | null {
  let surah: number | null =
    typeof input.surahNumber === 'number' &&
    Number.isInteger(input.surahNumber) &&
    input.surahNumber >= 1 &&
    input.surahNumber <= 114
      ? input.surahNumber
      : null;

  if (!surah && input.surahName) {
    surah = resolveSurahNumber(input.surahName);
  }

  const refNormalized = input.verseReference
    ? normalizeArabicDigits(input.verseReference)
    : '';

  if (!surah && refNormalized) {
    surah = resolveSurahNumber(refNormalized);
  }

  if (!surah) return null;

  // Extract ayah number or range (e.g., "255", "5-6", "آية 186")
  const numSource = input.verseNumber
    ? normalizeArabicDigits(String(input.verseNumber))
    : refNormalized;

  const rangeMatch = numSource.match(/(\d{1,3})\s*[-–—:إلى]+\s*(\d{1,3})/);
  let ayahStart = 1;
  let ayahEnd = 1;

  if (rangeMatch && !numSource.includes(':' + rangeMatch[2]) && input.verseNumber) {
    ayahStart = parseInt(rangeMatch[1], 10);
    ayahEnd = parseInt(rangeMatch[2], 10);
  } else {
    // Look specifically after ':' if parsing verseReference like "(البقرة : 5-6)"
    const afterColon = numSource.includes(':') ? numSource.split(':').pop() || '' : numSource;
    const afterRange = afterColon.match(/(\d{1,3})\s*[-–—]\s*(\d{1,3})/);
    if (afterRange) {
      ayahStart = parseInt(afterRange[1], 10);
      ayahEnd = parseInt(afterRange[2], 10);
    } else {
      const single = afterColon.match(/(\d{1,3})/);
      if (!single) return null;
      ayahStart = parseInt(single[1], 10);
      ayahEnd = ayahStart;
    }
  }

  if (
    !Number.isInteger(ayahStart) ||
    ayahStart < 1 ||
    ayahStart > 286
  ) {
    return null;
  }

  if (!Number.isInteger(ayahEnd) || ayahEnd < ayahStart) {
    ayahEnd = ayahStart;
  }
  // Cap consecutive ayahs to 4 per clip to keep video concise and responsive
  if (ayahEnd - ayahStart > 3) {
    ayahEnd = ayahStart + 3;
  }

  return {
    surah,
    ayahStart,
    ayahEnd,
    surahNameAr: SURAH_NAMES_AR[surah - 1] || '',
  };
}
