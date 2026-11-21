import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  RefreshCw, 
  Download, 
  ChevronRight,
  Loader2,
  MessageCircle,
  Layers,
  Edit3,
  Calendar,
  ChevronLeft,
  Moon,
  Sun,
  Search,
  History as HistoryIcon,
  BookOpen,
  Trash2,
  Copy,
  Square,
  ExternalLink,
  Volume2,
  Check,
  Wand2,
  Upload,
  AtSign,
  Frame,
  Palette,
  Film,
  Quote,
  Feather,
  Settings,
  Headphones
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { 
  generateReligiousContent, 
  generateReligiousImageWithMeta, 
  suggestTopics, 
  ASPECT_RATIOS, 
  AspectRatio,
  GeneratedPost,
  THEMES,
  THEME_LABELS,
  Theme,
  PostTone,
  RefineAction,
  TONE_LABELS,
  refineReligiousContent,
  getDailyDhikr,
  generateReligiousSeries,
  fetchQuranAudio,
  fetchQuranRecitation,
  generateSpiritualAudio
} from './services/geminiService';
import { 
  getLocalFallbackPost, 
  getLocalFallbackImage, 
  getDefaultCitationsForCategory,
  HERO_PREVIEW_IMAGE,
  LOCAL_ISLAMIC_ARTWORKS,
  ARTWORK_CATEGORIES,
  ArtworkCategory,
  GRADIENT_BACKDROPS,
  GradientBackdrop,
  computeManuscriptTextDensity,
  createGradientDataUrl
} from './services/localArchive';
import {
  CITATION_TYPE_LABELS,
  SupportingCitation,
  getCategoryEditorialProfile,
  buildReflectionWithCitationSpeech,
} from './utils/categoryEditorial';
import { QURAN_RECITERS, getReciterById } from './utils/quranData';
import { GalleryView } from './components/GalleryView';
import { VideoStudioModal } from './components/VideoStudioModal';
import { ImageExportModal } from './components/ImageExportModal';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { loadAiKeyConfig, subscribeAiKeyConfig } from './services/aiKeyManager';
import {
  PosterDesignStyle,
  PosterExportFormat,
  exportVerticalPosterBlob,
} from './services/posterExportService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// HTML2Canvas struggles with modern CSS color functions like oklch or oklab
const colorCache = new Map<string, string>();
const canvasElement = typeof document !== 'undefined' ? document.createElement('canvas') : null;
if (canvasElement) {
  canvasElement.width = 1;
  canvasElement.height = 1;
}
const tempCtx = canvasElement ? canvasElement.getContext('2d') : null;

const toSafeColor = (colorStr: string): string => {
  if (!colorStr) return colorStr;
  if (!colorStr.includes('oklch') && !colorStr.includes('oklab')) return colorStr;
  
  const cached = colorCache.get(colorStr);
  if (cached) return cached;

  try {
    if (tempCtx) {
      tempCtx.clearRect(0, 0, 1, 1);
      tempCtx.fillStyle = colorStr;
      tempCtx.fillRect(0, 0, 1, 1);
      const imgData = tempCtx.getImageData(0, 0, 1, 1).data;
      if (imgData[3] !== 0 || colorStr.includes('transparent')) {
        const rgbStr = `rgba(${imgData[0]}, ${imgData[1]}, ${imgData[2]}, ${(imgData[3] / 255).toFixed(3)})`;
        colorCache.set(colorStr, rgbStr);
        return rgbStr;
      }
    }
  } catch (e) {
    // Ignore error
  }

  // Basic fallbacks if canvas resolver fails
  return colorStr.includes('white') || colorStr.includes('100%') ? '#ffffff' : '#1a1a1a';
};

const executeHtml2Canvas = async (element: HTMLElement, options: any) => {
  if (typeof window === 'undefined') return;
  
  // Save original getComputedStyle of the parent window
  const originalGetComputedStyle = window.getComputedStyle;
  
  // Overwrite parent window's getComputedStyle during html2canvas execution
  window.getComputedStyle = function(el, pseudoElt) {
    const styleObj = originalGetComputedStyle.call(window, el, pseudoElt);
    return new Proxy(styleObj, {
      get(target, prop, receiver) {
        if (prop === 'getPropertyValue') {
          return function(propertyName: string) {
            const val = target.getPropertyValue(propertyName);
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              return toSafeColor(val);
            }
            return val;
          };
        }
        const val = Reflect.get(target, prop);
        if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
          return toSafeColor(val);
        }
        return typeof val === 'function' ? val.bind(target) : val;
      }
    });
  };

  try {
    // Import html2canvas dynamically if needed, or use the global/imported one
    const canvas = await html2canvas(element, options);
    return canvas;
  } finally {
    // Always restore original getComputedStyle
    window.getComputedStyle = originalGetComputedStyle;
  }
};


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ASPECT_RATIO_LABELS: Record<AspectRatio, string> = {
  '1:1': 'مربع (1:1)',
  '4:3': 'أفقي (4:3)',
  '3:4': 'عمودي (3:4)',
  '16:9': 'عرضي (16:9)',
  '9:16': 'طولي (9:16)'
};

const CATEGORIES = [
  "موضوع تلقائي",
  "خواطر قرآنية",
  "السكينة وجبر الخواطر",
  "الأدعية والمناجاة",
  "مواسم الخير ورمضان",
  "أحاديث نبوية",
  "سيرة نبوية",
  "قصص قرآنية ونبوية",
  "أخلاق الإسلام",
  "بر الوالدين والأسرة",
  "تطوير الذات الإيماني",
  "فضائل الأعمال",
  "تربية إيمانية",
  "القدس والمسجد الأقصى",
  "حكايات من التاريخ الإسلامي",
  "بطولات إسلامية",
  "شخصيات إسلامية",
  "عظماء الإسلام",
  "شعر إسلامي"
];

export default function App() {
  const [topic, setTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('موضوع تلقائي');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [autoGenerateImage, setAutoGenerateImage] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [theme, setTheme] = useState<Theme>('auto');
  const [postTone, setPostTone] = useState<PostTone>('balanced');
  const [layoutTemplate, setLayoutTemplate] = useState<'standard' | 'overlay' | 'card' | 'split'>('standard');
  const [cardFrameStyle, setCardFrameStyle] = useState<'clean' | 'gold-border'>('clean');
  const [cardAccentColor, setCardAccentColor] = useState<string>('#5A5A40');
  const [presetTab, setPresetTab] = useState<'artworks' | 'gradients'>('artworks');
  const [activeManuscriptId, setActiveManuscriptId] = useState<string | null>(null);
  const [studioControlTab, setStudioControlTab] = useState<'style' | 'edit' | 'artworks' | 'contrast'>('style');
  const [studioArtworkCategory, setStudioArtworkCategory] = useState<ArtworkCategory>('all');
  const [postHistory, setPostHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [step, setStep] = useState<'input' | 'gallery' | 'preview' | 'history' | 'search'>('input');
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [refining, setRefining] = useState<RefineAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dailyDhikr, setDailyDhikr] = useState('');
  const [isSeriesMode, setIsSeriesMode] = useState(false);
  const [seriesPosts, setSeriesPosts] = useState<GeneratedPost[]>([]);
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false);
  const [isNarrationLoading, setIsNarrationLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customAiKeyCount, setCustomAiKeyCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return loadAiKeyConfig().keys.filter((k) => k.enabled).length;
    }
    return 0;
  });
  const [selectedReciter, setSelectedReciter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('noor_reciter') || 'ar.alafasy';
    }
    return 'ar.alafasy';
  });
  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState(false);
  const [isImageExportOpen, setIsImageExportOpen] = useState(false);
  const [imageExportInitialFormat, setImageExportInitialFormat] =
    useState<PosterExportFormat>('whatsapp-9x16');
  const [activeCitationIndex, setActiveCitationIndex] = useState<number>(0);
  const [showSupportingCitationOnCard, setShowSupportingCitationOnCard] = useState<boolean>(true);
  const activePreviewAudioRef = useRef<HTMLAudioElement | null>(null);

  const CARD_ACCENTS = [
    { id: '#5A5A40', label: 'زيتوني تراثي' },
    { id: '#9A7426', label: 'ذهبي عتيق' },
    { id: '#145348', label: 'زمردي هادئ' },
    { id: '#1E3A5F', label: 'كحلي وقور' },
  ];

  const activeManuscript: GradientBackdrop | null = activeManuscriptId
    ? GRADIENT_BACKDROPS.find((b) => b.id === activeManuscriptId) || null
    : null;

  const activeEditorialProfile = getCategoryEditorialProfile(selectedCategory);
  const activeCitations: SupportingCitation[] =
    post?.citations && post.citations.length > 0 ? post.citations : [];
  const safeCitationIndex =
    activeCitations.length > 0 ? Math.min(activeCitationIndex, activeCitations.length - 1) : 0;
  const activeCitation: SupportingCitation | null = activeCitations[safeCitationIndex] || null;

  const formatCitationsForText = (citations?: SupportingCitation[]): string => {
    if (!citations || citations.length === 0) return '';
    return citations
      .map((c) => {
        const icon =
          c.type === 'hadith' ? '📜' : c.type === 'poetry' ? '🪶' : c.type === 'quran' ? '📖' : '💎';
        const formattedBody =
          c.type === 'poetry' && c.text.includes('/')
            ? c.text
                .split('/')
                .map((part) => part.trim())
                .filter(Boolean)
                .join('\n')
            : c.text;
        const header = c.prefix ? `${icon} ${c.label} — ${c.prefix}` : `${icon} ${c.label}:`;
        const sourceLine = c.source ? `\n(${c.source})` : '';
        return `${header}\n${formattedBody}${sourceLine}`;
      })
      .join('\n\n');
  };

  const getActiveTextLengthOnImage = (targetPost: GeneratedPost | null) => {
    if (!targetPost) return 0;
    if (layoutTemplate === 'overlay') {
      const targetCitations = targetPost.citations || [];
      const targetActiveCitation =
        showSupportingCitationOnCard && targetCitations.length > 0
          ? targetCitations[Math.min(activeCitationIndex, targetCitations.length - 1)]
          : null;
      return (
        (showTopic ? (targetPost.topic?.length || 0) : 0) +
        (showReflection ? (targetPost.content?.length || 0) : 0) +
        (showVerseTextInText ? (targetPost.verseText?.length || 0) : 0) +
        (targetActiveCitation ? targetActiveCitation.text.length : 0)
      );
    }
    if (showVerseOnImage && targetPost.verseText) {
      return (targetPost.versePrefix?.length || 0) + targetPost.verseText.length;
    }
    return 0;
  };

  const handleSelectArtworkFromGallery = (imageSrc: string, suggestedLabel?: string) => {
    setActiveManuscriptId(null);
    setImageUrl(imageSrc);
    setError(null);
    if (!post) {
      const matchedPost = getLocalFallbackPost(undefined, suggestedLabel);
      setPost(matchedPost);
      setActiveCitationIndex(0);
      addToHistory(matchedPost, imageSrc, null);
    }
    setStep('preview');
    showToast(suggestedLabel ? `تم تطبيق لوحة «${suggestedLabel}» في الاستوديو` : 'تم تطبيق اللوحة في الاستوديو');
  };

  const handleSelectManuscriptFromGallery = (backdrop: GradientBackdrop) => {
    const targetPost = post || getLocalFallbackPost(undefined, backdrop.name);
    const dataUrl = createGradientDataUrl(backdrop, {
      aspectRatio,
      textLength: getActiveTextLengthOnImage(targetPost),
      hasVerse: Boolean(targetPost.verseText && (showVerseOnImage || layoutTemplate === 'overlay')),
      hasFullOverlay: layoutTemplate === 'overlay',
      fontSize,
    });
    setActiveManuscriptId(backdrop.id);
    setImageUrl(dataUrl);
    setError(null);
    if (!post) {
      setPost(targetPost);
      addToHistory(targetPost, dataUrl, backdrop.id);
    }
    setStep('preview');
    showToast(`تم تطبيق مخطوطة «${backdrop.name}» المتكيفة مع مقاس ${aspectRatio}`);
  };
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Amiri');
  const [pageSignature, setPageSignature] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('noor_page_signature') || '';
    }
    return '';
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Majestic Islamic Arabic calligraphy fonts
  const ARABIC_FONTS = [
    { id: 'Amiri', name: 'أَميري (خط المصحف الشريف)', family: '"Amiri", serif' },
    { id: 'Cairo', name: 'القاهرة (رسمي وعصري متناسق)', family: '"Cairo", sans-serif' },
    { id: 'Lateef', name: 'لطيف (نمط نسخي رفيع)', family: '"Lateef", serif' },
    { id: 'Scheherazade New', name: 'شهرزاد (جمالية تراثية ممتازة)', family: '"Scheherazade New", serif' },
    { id: 'Reem Kufi', name: 'كوفي (نمط هندسي قديم)', family: '"Reem Kufi", sans-serif' },
    { id: 'Katibeh', name: 'كاتبة (طابع المخطوطات القديمة)', family: '"Katibeh", serif' },
    { id: 'Noto Serif Arabic', name: 'نوتو سيريف (رسمي ومتقن)', family: '"Noto Serif Arabic", serif' },
    { id: 'Ruqaa', name: 'الرقعة (خط اليد التعبيري المائل)', family: '"Ruqaa", serif' }
  ];

  const getSelectedFontFamily = (fontId: string) => {
    const found = ARABIC_FONTS.find(f => f.id === fontId);
    if (found) return found.family;
    if (fontId === 'serif') return '"Amiri", serif';
    if (fontId === 'sans') return '"Cairo", sans-serif';
    if (fontId === 'mono') return 'monospace';
    return '"Amiri", serif';
  };

  const [showVerseOnImage, setShowVerseOnImage] = useState(true);
  const [imageBrightness, setImageBrightness] = useState<number | null>(null);
  const [isAnalyzingContrast, setIsAnalyzingContrast] = useState(false);
  const [autoEnhanceContrast, setAutoEnhanceContrast] = useState(true);
  const [dynamicOverlayOpacity, setDynamicOverlayOpacity] = useState<number>(0.35);
  const [showTopic, setShowTopic] = useState(true);
  const [showReflection, setShowReflection] = useState(true);
  const [showVersePrefixInText, setShowVersePrefixInText] = useState(true);
  const [showVerseReferenceInText, setShowVerseReferenceInText] = useState(true);
  const [showVerseTextInText, setShowVerseTextInText] = useState(true);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [activeSearchAudio, setActiveSearchAudio] = useState<HTMLAudioElement | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('noor_theme') === 'dark';
    }
    return false;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('noor_page_signature', pageSignature);
    }
  }, [pageSignature]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('noor_reciter', selectedReciter);
    }
  }, [selectedReciter]);

  useEffect(() => {
    return subscribeAiKeyConfig(() => {
      setCustomAiKeyCount(loadAiKeyConfig().keys.filter((k) => k.enabled).length);
    });
  }, []);

  // Dynamically re-render manuscript backdrop whenever aspect ratio, layout, or text content changes
  useEffect(() => {
    if (!activeManuscriptId) return;
    const backdrop = GRADIENT_BACKDROPS.find((b) => b.id === activeManuscriptId);
    if (!backdrop) return;

    const timer = window.setTimeout(() => {
      const textLen = getActiveTextLengthOnImage(post);
      const nextUrl = createGradientDataUrl(backdrop, {
        aspectRatio,
        textLength: textLen,
        hasVerse: Boolean(post?.verseText && (showVerseOnImage || layoutTemplate === 'overlay')),
        hasFullOverlay: layoutTemplate === 'overlay',
        fontSize,
      });
      setImageUrl(nextUrl);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [
    activeManuscriptId,
    aspectRatio,
    layoutTemplate,
    fontSize,
    showVerseOnImage,
    showTopic,
    showReflection,
    showVerseTextInText,
    showSupportingCitationOnCard,
    activeCitationIndex,
    post?.topic,
    post?.content,
    post?.verseText,
    post?.versePrefix,
    activeCitation?.text,
  ]);

  useEffect(() => {
    return () => {
      if (activeSearchAudio) {
        activeSearchAudio.pause();
      }
    };
  }, [activeSearchAudio]);

  useEffect(() => {
    if (step !== 'search' && activeSearchAudio) {
      activeSearchAudio.pause();
      setPlayingAudioId(null);
    }
  }, [step, activeSearchAudio]);

  const handleRefinePost = async (action: RefineAction) => {
    if (!post || refining) return;
    setRefining(action);
    setError(null);
    try {
      const refined = await refineReligiousContent(post, action);
      setPost(refined);
      if (action === 'enrich_citations') {
        setActiveCitationIndex(0);
        setShowSupportingCitationOnCard(true);
      }
      if (isSeriesMode && seriesPosts.length > 0) {
        setSeriesPosts((prev) => prev.map((p, idx) => (idx === currentSeriesIndex ? refined : p)));
      }
      showToast(
        action === 'enrich_citations'
          ? '✨ تم إثراء المنشور بشواهد جديدة من الحديث والشعر والحكم'
          : '✨ تم تحسين صياغة المنشور بنجاح'
      );
    } catch (err: any) {
      setError(err?.message || 'تعذر تحسين الصياغة حالياً. حاول مرة أخرى بعد قليل.');
    } finally {
      setRefining(null);
    }
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (JPG / PNG / WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setActiveManuscriptId(null);
        setImageUrl(reader.result);
        setError(null);
        showToast('🖼️ تم تطبيق صورتك الخاصة على اللوحة بنجاح');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCopyFacebookCaption = async () => {
    if (!post) return;
    const verseBlock = post.verseText
      ? `\n\n📖 ${post.versePrefix || 'قال تعالى:'}\n﴿ ${post.verseText} ﴾\n${post.verseReference || (post.surahName ? `(${post.surahName} : ${post.verseNumber || ''})` : '')}`
      : '';
    const citationsText = formatCitationsForText(post.citations);
    const citationsBlock = citationsText ? `\n\n${citationsText}` : '';
    const sigBlock = pageSignature.trim() ? `\n\n— ${pageSignature.trim()}` : '';
    const fullCaption = `✨ ${post.topic}\n\n${post.content}${verseBlock}${citationsBlock}${sigBlock}\n\n#نور #إسلاميات #تدبر #خواطر_إيمانية`;
    try {
      await navigator.clipboard.writeText(fullCaption);
      setCopyFeedback('post-caption');
      setTimeout(() => setCopyFeedback(null), 2200);
      showToast('📋 تم نسخ نص المنشور مع الشواهد والهاشتاجات وجاهز للنشر!');
    } catch {
      setError('تعذر النسخ التلقائي للحافظة.');
    }
  };

  const stopPreviewAudio = () => {
    if (activePreviewAudioRef.current) {
      activePreviewAudioRef.current.pause();
      activePreviewAudioRef.current = null;
    }
    setIsPlaying(false);
    setIsAudioLoading(false);
    setIsNarrationPlaying(false);
    setIsNarrationLoading(false);
  };

  const playReflectionAndCitation = async () => {
    if (isNarrationPlaying || isNarrationLoading) {
      stopPreviewAudio();
      return;
    }
    if (!post) return;
    stopPreviewAudio();

    const baseText = (post.content?.trim() || post.topic?.trim() || '').trim();
    const spokenText = buildReflectionWithCitationSpeech(
      baseText,
      showSupportingCitationOnCard ? activeCitation : null,
      Boolean(showSupportingCitationOnCard && activeCitation?.text?.trim())
    );
    if (!spokenText) {
      showToast('لا يوجد نص أو شاهد متاح للقراءة حالياً.');
      return;
    }

    setIsNarrationPlaying(true);
    setIsNarrationLoading(true);
    try {
      const url = await generateSpiritualAudio(spokenText, 'reflection', 'Kore');
      setIsNarrationLoading(false);
      if (url) {
        const audio = new Audio(url);
        activePreviewAudioRef.current = audio;
        audio.onended = () => {
          if (activePreviewAudioRef.current === audio) {
            activePreviewAudioRef.current = null;
            setIsNarrationPlaying(false);
          }
        };
        audio.onerror = () => {
          activePreviewAudioRef.current = null;
          setIsNarrationPlaying(false);
        };
        await audio.play();
      } else {
        setIsNarrationPlaying(false);
        showToast(
          'تعذر تشغيل القراءة الصوتية حالياً (ربما انتهت الحصة اليومية). يمكنك إضافة مفتاح Gemini خاص بك من الإعدادات.'
        );
      }
    } catch (err) {
      console.error('Reflection narration failed', err);
      stopPreviewAudio();
      showToast('تعذر تشغيل قراءة النص والشاهد حالياً.');
    }
  };

  const playAudio = async (text: string) => {
    if (isPlaying || isAudioLoading) {
      stopPreviewAudio();
      return;
    }
    stopPreviewAudio();
    setIsPlaying(true);
    setIsAudioLoading(true);
    try {
      // 1. Try authentic Quran reciter first when post contains a Quranic verse
      const recitation = await fetchQuranRecitation({
        surahNumber: post?.surahNumber,
        surahName: post?.surahName,
        verseNumber: post?.verseNumber,
        verseReference: post?.verseReference,
        verseText: text,
        reciter: selectedReciter,
      });

      if (recitation?.resolved && recitation.clips && recitation.clips.length > 0) {
        setIsAudioLoading(false);
        const clips = recitation.clips;
        let idx = 0;

        const playNextClip = () => {
          if (idx >= clips.length) {
            activePreviewAudioRef.current = null;
            setIsPlaying(false);
            return;
          }
          const clip = clips[idx++];
          const audio = new Audio(`data:${clip.mimeType || 'audio/mpeg'};base64,${clip.base64}`);
          activePreviewAudioRef.current = audio;
          audio.onended = () => {
            if (activePreviewAudioRef.current === audio) {
              playNextClip();
            }
          };
          audio.onerror = () => {
            activePreviewAudioRef.current = null;
            setIsPlaying(false);
          };
          audio.play().catch(() => {
            activePreviewAudioRef.current = null;
            setIsPlaying(false);
          });
        };

        playNextClip();
        return;
      }

      // 2. Fallback to serene spiritual narration for Hadith / Dua / custom text
      const url = await generateSpiritualAudio(text, 'verse', 'Charon');
      setIsAudioLoading(false);
      if (url) {
        const audio = new Audio(url);
        activePreviewAudioRef.current = audio;
        audio.onended = () => {
          activePreviewAudioRef.current = null;
          setIsPlaying(false);
        };
        audio.onerror = () => {
          activePreviewAudioRef.current = null;
          setIsPlaying(false);
        };
        await audio.play();
      } else {
        setIsPlaying(false);
        showToast('تعذر تشغيل التلاوة حالياً، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error("Audio playback failed", err);
      stopPreviewAudio();
    }
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const toggleSearchAudio = async (surahNumber: number, verseNumber: number, id: string) => {
    if (playingAudioId === id) {
      if (activeSearchAudio) {
        activeSearchAudio.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    if (activeSearchAudio) {
      activeSearchAudio.pause();
    }

    setPlayingAudioId(id);
    try {
      const audioUrl = await fetchQuranAudio(surahNumber, verseNumber, selectedReciter);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        setActiveSearchAudio(audio);
        audio.onended = () => {
          setPlayingAudioId(null);
        };
        audio.play();
      } else {
        setPlayingAudioId(null);
        setError('تعذر تحميل الملف الصوتي لهذه الآية.');
      }
    } catch (err) {
      console.error("Error playing Quran audio:", err);
      setPlayingAudioId(null);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('noor_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('noor_theme', 'light');
    }
  }, [darkMode]);

  // Analyze background image brightness for smart color contrast calculation
  useEffect(() => {
    if (!imageUrl) {
      setImageBrightness(null);
      return;
    }

    setIsAnalyzingContrast(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 32, 32);
          const data = ctx.getImageData(0, 0, 32, 32).data;
          let rSum = 0, gSum = 0, bSum = 0;
          let count = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            const a = data[i+3];
            
            if (a > 50) { // Solid colors focus
              rSum += r;
              gSum += g;
              bSum += b;
              count++;
            }
          }
          
          if (count > 0) {
            const rAvg = rSum / count;
            const gAvg = gSum / count;
            const bAvg = bSum / count;
            
            // Standard relative luminance formula
            const brightness = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
            setImageBrightness(Math.round(brightness));
          } else {
            setImageBrightness(120);
          }
        } else {
          setImageBrightness(120);
        }
      } catch (err) {
        console.warn("Luminance extraction failed due to security/CORS, falling back to dynamic default", err);
        setImageBrightness(120);
      } finally {
        setIsAnalyzingContrast(false);
      }
    };
    
    img.onerror = () => {
      setImageBrightness(120);
      setIsAnalyzingContrast(false);
    };
  }, [imageUrl]);

  const getDynamicOverlayOpacity = () => {
    if (imageBrightness === null) return 0.35;
    if (!autoEnhanceContrast) return dynamicOverlayOpacity;
    
    // Auto design contrast mapping
    if (imageBrightness > 200) return 0.55; // Highly light image
    if (imageBrightness > 160) return 0.45; // Medium light image
    if (imageBrightness < 80) return 0.22;  // Dark image
    if (imageBrightness < 120) return 0.30; // Medium dark image
    return 0.38;                            // Middle balance
  };

  const getContrastStatus = () => {
    if (imageBrightness === null) {
      return {
        score: "...",
        level: "تحليل...",
        color: "text-zinc-400 border-zinc-200 dark:border-zinc-800",
        bg: "bg-zinc-500/10",
        message: "جاري استشعار ألوان اللوحة وتحليل تباين النص...",
        icon: "⏳",
        badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
      };
    }
    
    if (imageBrightness > 190) {
      return {
        score: "3.2:1 (منخفض للخطوط البيضاء)",
        level: "تباين دقيق جداً ⚠️",
        color: "text-amber-600 border-amber-200 dark:border-amber-900/30",
        bg: "bg-amber-500/5",
        message: "الخلفية فاتحة جداً! تم تطبيق تعتيم إضافي تلقائياً لحفظ هيبة النص ومقروئيته الكاملة.",
        icon: "⚠️",
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
      };
    } else if (imageBrightness > 140) {
      return {
        score: "5.1:1 (مقبول)",
        level: "تباين متوازن ورائع (AA) ✓",
        color: "text-emerald-600 border-emerald-200 dark:border-emerald-900/30",
        bg: "bg-emerald-500/5",
        message: "الخلفية متوسطة السطوع. التباين مُحسَّن وممتاز لسهولة القراءة لجميع الأعمار.",
        icon: "✨",
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
      };
    } else {
      return {
        score: "8.5:1 (ممتاز جداً)",
        level: "تباين فائق النقاهة والجمال (AAA) ✓✓",
        color: "text-brand-olive border-brand-olive/15 dark:border-zinc-800",
        bg: "bg-brand-olive/5",
        message: "الخلفية داكنة تماماً ومثالية للتصميم البصري. مقروئية الآية الكريمة والخط في أعلى درجاتها.",
        icon: "🛡️",
        badge: "bg-brand-olive/10 text-brand-olive dark:bg-zinc-800 dark:text-brand-gold"
      };
    }
  };

  useEffect(() => {
    loadSuggestions();
    loadDailyDhikr();
    loadHistory();
  }, []);

  const loadHistory = () => {
    const saved = localStorage.getItem('noor_history');
    if (saved) {
      try {
        setPostHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  };

  const saveHistoryWithPruning = (historyList: any[]) => {
    let currentHistory = [...historyList];
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      try {
        const serialized = JSON.stringify(currentHistory);
        localStorage.setItem('noor_history', serialized);
        localStorage.setItem('noor_history_backup_silent', serialized);
        // Success! Sync react state
        setPostHistory(currentHistory);
        return true;
      } catch (error: any) {
        const isQuotaError = 
          error.name === 'QuotaExceededError' || 
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
          error.code === 22 || 
          error.code === 1014;

        if (!isQuotaError) {
          console.error("Unknown localStorage error", error);
          break;
        }

        // It is a quota exceeded error! Prune oldest custom images first.
        let prunedAny = false;
        for (let i = currentHistory.length - 1; i >= 0; i--) {
          const item = currentHistory[i];
          if (item.imageUrl && item.imageUrl.length > 500) {
            currentHistory[i] = {
              ...item,
              imageUrl: null
            };
            prunedAny = true;
            break; // Prune one and retry
          }
        }

        if (!prunedAny) {
          // If no large images are left to prune, delete oldest items completely
          if (currentHistory.length > 5) {
            currentHistory.pop();
          } else {
            // Cannot prune any further
            break;
          }
        }
        attempts++;
      }
    }

    // Fallback: Save minimal text backup if standard loop failed
    try {
      const minimalHistory = currentHistory.slice(0, 5).map(item => ({
        ...item,
        imageUrl: null
      }));
      const serialized = JSON.stringify(minimalHistory);
      localStorage.setItem('noor_history', serialized);
      localStorage.setItem('noor_history_backup_silent', serialized);
      setPostHistory(minimalHistory);
      return true;
    } catch (fallbackErr) {
      console.error("Critical localStorage failure", fallbackErr);
      return false;
    }
  };

  const addToHistory = (p: GeneratedPost, img: string | null, manuscriptId: string | null = activeManuscriptId) => {
    const newEntry = {
      id: Date.now().toString(),
      post: p,
      imageUrl: img,
      manuscriptId,
      timestamp: new Date().toISOString(),
      aspectRatio,
      layoutTemplate
    };
    const updated = [newEntry, ...postHistory].slice(0, 50); // Keep last 50
    saveHistoryWithPruning(updated);
  };

  const handleGenerateImageOnly = async () => {
    if (!post) return;
    setGeneratingImage(true);
    setError(null);
    try {
      let prompt = post.topic;
      if (post.topic === 'آية مختارة' && post.verseText) {
        prompt = `Islamic visual concept, spiritual, peaceful, reflecting meaning of: ${post.verseText}`;
      } else if (post.verseText) {
        prompt = `${post.topic}. Reflecting spiritual meaning of: ${post.verseText}`;
      }
      const imgResult = await generateReligiousImageWithMeta(prompt, aspectRatio, theme);
      setActiveManuscriptId(null);
      setImageUrl(imgResult.imageUrl);
      addToHistory(post, imgResult.imageUrl, null);

      if (imgResult.isFallback) {
        setError('💡 تم اختيار مشهد إسلامي راقٍ من المكتبة الجاهزة لعدم توفر حصة توليد الصور بالذكاء الاصطناعي حالياً. يمكنك اختيار أي خلفية أخرى من (معرض الخلفيات الجاهزة) بالأسفل!');
      }
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSearchQuran = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/all/quran-simple-clean`);
      const data = await response.json();
      if (data.code === 200 && data.status === 'OK') {
        setSearchResults(data.data.matches || []);
      } else {
        setError('تعذر العثور على نتائج للبحث.');
      }
    } catch (err) {
      console.error("Search failed", err);
      setError('حدث خطأ أثناء البحث في القرآن الكريم.');
    } finally {
      setSearching(false);
    }
  };

  const selectVerseFromSearch = async (match: any) => {
    setSearching(true);
    let finalVerseText = match.text;
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${match.surah.number}:${match.numberInSurah}/quran-simple`);
      const data = await response.json();
      if (data.code === 200 && data.status === 'OK' && data.data && data.data.text) {
        finalVerseText = data.data.text;
      }
    } catch (err) {
      console.error("Failed to fetch vocalized ayah", err);
    } finally {
      setSearching(false);
    }

    const verseRef = `(${match.surah.name} : ${match.numberInSurah})`;
    const matchedArtwork = getLocalFallbackImage(finalVerseText);
    const createdPost: GeneratedPost = {
      topic: match.surah.name || 'آية مختارة',
      content: '',
      versePrefix: 'قال تعالى:',
      verseText: finalVerseText,
      surahNumber: match.surah.number,
      surahName: match.surah.name,
      verseNumber: match.numberInSurah.toString(),
      verseReference: verseRef
    };
    setPost(createdPost);
    setActiveManuscriptId(null);
    setImageUrl(matchedArtwork);
    addToHistory(createdPost, matchedArtwork, null);
    setStep('preview');
  };

  const loadDailyDhikr = async () => {
    try {
      const dhikr = await getDailyDhikr();
      setDailyDhikr(dhikr);
    } catch (err) {
      console.error("Failed to load daily dhikr", err);
    }
  };

  // Diverse fallback image system using our smart curated local archive
  const getFallbackImageUrl = (seed: string) => {
    return getLocalFallbackImage(seed);
  };

  const loadSuggestions = async (category?: string, forceRefresh: boolean = false) => {
    setLoadingSuggestions(true);
    setError(null);
    try {
      const topics = await suggestTopics(category || selectedCategory, forceRefresh);
      setSuggestions(topics);
    } catch (err: any) {
      console.error("Failed to load suggestions", err);
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('الحصة')) {
        setError('لقد تجاوزت حد الاستخدام المجاني. يرجى الانتظار قليلاً والمحاولة مرة أخرى.');
      }
    } finally {
      setLoadingSuggestions(false);
    }
  };

    const handleGenerate = async () => {
    if (!topic.trim()) return;
    const currentTopic = topic;
    setGenerating(true);
    setPost(null);
    setActiveManuscriptId(null);
    setImageUrl(null);
    setError(null);
    setSeriesPosts([]);
    setCurrentSeriesIndex(0);
    setActiveCitationIndex(0);
    
    try {
      if (isSeriesMode) {
        let series;
        try {
          series = await generateReligiousSeries(currentTopic, 3, postTone, selectedCategory);
        } catch (err: any) {
          console.warn("AI Series generation fallback:", err);
          const p1 = getLocalFallbackPost(selectedCategory, currentTopic + "1");
          const p2 = getLocalFallbackPost(selectedCategory, currentTopic + "2");
          const p3 = getLocalFallbackPost(selectedCategory, currentTopic + "3");
          series = [p1, p2, p3];
          setError('💡 عذراً، تم الاستعانة بسلسلة موضوعية مميزة من (أرشيف نور الإيماني المحلي الذكي) لتعذر الاتصال بالذكاء الاصطناعي بسبب استهلاك الحصة أو انقطاع الخدمة.');
        }
        setSeriesPosts(series);
        setPost(series[0]);
        setStep('preview');
        
        if (autoGenerateImage) {
          const imgResult = await generateReligiousImageWithMeta(series[0].topic, aspectRatio, theme);
          setImageUrl(imgResult.imageUrl);
          addToHistory(series[0], imgResult.imageUrl);
          if (imgResult.isFallback) {
            setError('💡 تم جلب صورة إسلامية راقية كبديل لتعذر توليد الصورة بالذكاء الاصطناعي حالياً. يمكنك اختيار مشهد بديع آخر من (معرض الخلفيات الجاهزة) بلوحة التصميم بالأسفل!');
          }
        } else {
          addToHistory(series[0], null);
        }
      } else {
        let content;
        try {
          content = await generateReligiousContent(currentTopic, postTone, selectedCategory);
          setPost(content);
          setStep('preview');
          
          if (autoGenerateImage) {
            const imgResult = await generateReligiousImageWithMeta(content.topic, aspectRatio, theme);
            setImageUrl(imgResult.imageUrl);
            addToHistory(content, imgResult.imageUrl);
            if (imgResult.isFallback) {
              setError('💡 تم جلب صورة إسلامية راقية كبديل لتعذر توليد الصورة بالذكاء الاصطناعي حالياً. يمكنك اختيار مشهد بديع آخر من (معرض الخلفيات الجاهزة) بلوحة التصميم بالأسفل!');
            }
          } else {
            addToHistory(content, null);
          }
        } catch (err: any) {
          console.warn("Content generation fallback:", err);
          const fallbackPost = getLocalFallbackPost(selectedCategory, currentTopic);
          const fallbackImg = getFallbackImageUrl(currentTopic);
          setPost(fallbackPost);
          setStep('preview');
          setImageUrl(fallbackImg);
          addToHistory(fallbackPost, fallbackImg);
          setError('💡 عذراً، تعذر الاتصال بالذكاء الاصطناعي لتجاوز الحصة أو انقطاع الخدمة؛ تم سحب هذا المنشور المميز تلقائياً من (أرشيف نور الإيماني المحلي الذكي) مع تطبيق صورة إسلامية راقية. ويمكنك تغيير وتخصيص صورتك من (معرض الخلفيات الجاهزة) بالأسفل!');
        }
      }
      setTopic(''); 
    } catch (err: any) {
      console.warn("Unhandled generation issue:", err);
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSeriesNavigate = async (index: number) => {
    if (index < 0 || index >= seriesPosts.length) return;
    setCurrentSeriesIndex(index);
    const nextPost = seriesPosts[index];
    setPost(nextPost);
    setActiveCitationIndex(0);
    setActiveManuscriptId(null);
    setImageUrl(null);
    
    const imgResult = await generateReligiousImageWithMeta(nextPost.topic, aspectRatio, theme);
    setImageUrl(imgResult.imageUrl);
    if (imgResult.isFallback) {
      setError('💡 تم اختيار مشهد إسلامي بديل راقٍ من المكتبة الجاهزة. بإمكانك استعراض وتعيين صور فاخرة أخرى من (معرض الخلفيات الجاهزة) بالأسفل!');
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('post-preview');
    if (!element || downloading) return;
    setDownloading(true);

    try {
      const selectedFontFam = getSelectedFontFamily(fontFamily);
      const canvas = await executeHtml2Canvas(element, { 
        useCORS: true, 
        scale: 3,
        backgroundColor: layoutTemplate === 'overlay' ? '#09090b' : layoutTemplate === 'card' ? '#FAF7F2' : '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * { 
              color-scheme: light !important;
              -webkit-print-color-adjust: exact !important;
            }
            #post-preview {
              direction: rtl !important;
              text-align: center !important;
              font-family: ${selectedFontFam} !important;
            }
            #post-preview h3, #post-preview p, #post-preview span, #post-preview div {
              line-height: 1.45 !important;
              text-align: center !important;
              font-family: ${selectedFontFam} !important;
            }
            .bg-brand-cream { background-color: #f5f2ed !important; }
            .bg-brand-olive { background-color: #5A5A40 !important; }
            .text-brand-olive { color: #5A5A40 !important; }
            .text-brand-gold { color: #D4AF37 !important; }
            .border-brand-gold { border-color: #D4AF37 !important; }
            .text-brand-ink { color: #1a1a1a !important; }
            .bg-white { background-color: #ffffff !important; }
            .text-white { color: #ffffff !important; }
          `;
          clonedDoc.head.appendChild(style);

          // Override getComputedStyle inside the cloned iframe context to strip any oklab/oklch values
          const originalGetComputedStyle = clonedDoc.defaultView?.getComputedStyle;
          if (clonedDoc.defaultView && originalGetComputedStyle) {
            clonedDoc.defaultView.getComputedStyle = function(el, pseudoElt) {
              const styleObj = originalGetComputedStyle.call(clonedDoc.defaultView, el, pseudoElt);
              return new Proxy(styleObj, {
                get(target, prop, receiver) {
                  if (prop === 'getPropertyValue') {
                    return function(propertyName: string) {
                      const val = target.getPropertyValue(propertyName);
                      if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                        return toSafeColor(val);
                      }
                      return val;
                    };
                  }
                  const val = Reflect.get(target, prop);
                  if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                    return toSafeColor(val);
                  }
                  return typeof val === 'function' ? val.bind(target) : val;
                }
              });
            };
          }

          // Force replace all stylesheets with oklch/oklab to clean style strings to avoid parser crash
          try {
            const sheets = Array.from(clonedDoc.styleSheets);
            sheets.forEach((sheet: any) => {
              try {
                const rules = sheet.cssRules || sheet.rules;
                if (rules) {
                  let cleanCss = '';
                  let hasOkl = false;
                  for (let j = 0; j < rules.length; j++) {
                    let ruleText = rules[j].cssText;
                    if (ruleText.includes('oklch') || ruleText.includes('oklab')) {
                      hasOkl = true;
                      ruleText = ruleText
                        .replace(/oklch\([^)]+\)/g, (match) => toSafeColor(match))
                        .replace(/oklab\([^)]+\)/g, (match) => toSafeColor(match));
                    }
                    cleanCss += ruleText + '\n';
                  }
                  if (hasOkl) {
                    const newStyle = clonedDoc.createElement('style');
                    newStyle.textContent = cleanCss;
                    clonedDoc.head.appendChild(newStyle);
                    try {
                      sheet.disabled = true;
                    } catch (shErr) {}
                    if (sheet.ownerNode) {
                      try {
                        sheet.ownerNode.parentNode?.removeChild(sheet.ownerNode);
                      } catch (ndErr) {}
                    }
                  }
                }
              } catch (shEx) {}
            });
          } catch (stEx) {}

          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach(s => {
            try {
              s.innerHTML = s.innerHTML
                .replace(/oklch\([^)]+\)/g, (match) => toSafeColor(match))
                .replace(/oklab\([^)]+\)/g, (match) => toSafeColor(match));
            } catch (e) {
              s.remove();
            }
          });

          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.style) {
              if (el.style.backgroundColor?.includes('okl')) {
                el.style.backgroundColor = layoutTemplate === 'overlay' ? '#09090b' : layoutTemplate === 'card' ? '#FAF7F2' : '#ffffff';
              }
              if (el.style.color?.includes('okl')) {
                el.style.color = layoutTemplate === 'overlay' ? '#ffffff' : '#1a1a1a';
              }
              if (el.style.borderColor?.includes('okl')) el.style.borderColor = 'rgba(90, 90, 64, 0.15)';
            }
          }

          const clonedPreview = clonedDoc.getElementById('post-preview');
          if (clonedPreview && element) {
            const width = element.offsetWidth || element.getBoundingClientRect().width;
            clonedPreview.style.width = `${width}px`;
            clonedPreview.style.maxWidth = `${width}px`;
            clonedPreview.style.minWidth = `${width}px`;
          }

          const clonedImg = clonedDoc.getElementById('post-image') as HTMLImageElement | null;
          if (clonedImg) {
            const src = clonedImg.src;
            const parent = clonedImg.parentNode;
            if (parent) {
              const bgDiv = clonedDoc.createElement('div');
              bgDiv.style.width = '100%';
              bgDiv.style.height = '100%';
              bgDiv.style.backgroundImage = `url("${src}")`;
              bgDiv.style.backgroundSize = 'cover';
              bgDiv.style.backgroundPosition = 'center';
              bgDiv.style.backgroundRepeat = 'no-repeat';
              bgDiv.className = clonedImg.className;
              parent.replaceChild(bgDiv, clonedImg);
            }
          }
        }
      });
      if (!canvas) {
        throw new Error("Canvas generation returned null");
      }
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `noor-post-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('تم حفظ صورة البطاقة بدقة عالية على جهازك');
    } catch (error: any) {
      console.error("Download failed", error);
      setError('⚠️ تعذر تحميل التصميم كصورة حالياً بسبب قيود حجم أو أمان خلفية الصورة. يرجى تجربة الضغط على زر (مشاركة المنشور) بالأسفل كحل بديل ومثالي!');
    } finally {
      setDownloading(false);
    }
  };

  const openVerticalImageStudio = (format: PosterExportFormat = 'whatsapp-9x16') => {
    stopPreviewAudio();
    if (!imageUrl) {
      setImageUrl(getLocalFallbackImage(post?.topic || 'قرآن'));
    }
    setImageExportInitialFormat(format);
    setIsImageExportOpen(true);
  };

  const handleWhatsAppShare = async () => {
    if (!post) return;
    setSharing(true);

    try {
      const styleForShare: PosterDesignStyle =
        layoutTemplate === 'overlay'
          ? 'cinema-vertical'
          : layoutTemplate === 'card'
          ? 'manuscript-parchment'
          : 'royal-editorial';
      const resolvedImage = imageUrl || getLocalFallbackImage(post.topic || 'قرآن');
      const blob = await exportVerticalPosterBlob({
        post,
        imageUrl: resolvedImage,
        format: 'whatsapp-9x16',
        style: styleForShare,
        fontFamily,
        fontFamilyCss: getSelectedFontFamily(fontFamily),
        cardAccentColor,
        cardFrameStyle,
        overlayOpacity: getDynamicOverlayOpacity(),
        showTopic,
        showReflection,
        showVersePrefix: showVersePrefixInText,
        showVerseText: showVerseTextInText,
        showVerseReference: showVerseReferenceInText,
        activeCitation,
        showSupportingCitation: showSupportingCitationOnCard,
        pageSignature,
      });

      if (!blob) throw new Error('Failed to create vertical poster blob');

      const citationsShare = formatCitationsForText(post.citations);
      const shareText = `✨ *${post.topic}* ✨\n\n${post.content}${post.verseText ? `\n\n📖 ${post.versePrefix || 'قال تعالى:'}\n﴿ ${post.verseText} ﴾\n${post.verseReference || `[${post.surahName || 'آية كريمة'} : ${post.verseNumber || ''}]`}` : ''}${citationsShare ? `\n\n${citationsShare}` : ''}\n\nتم التوليد بواسطة تطبيق نور 💡`;

      let sharedSuccessfully = false;

      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], 'post.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: post.topic,
              text: shareText,
            });
            sharedSuccessfully = true;
          }
        } catch (err) {
          console.warn("Navigator share with file failed", err);
          try {
            await navigator.share({
              title: post.topic,
              text: shareText,
            });
            sharedSuccessfully = true;
          } catch (textErr) {
            console.warn("Navigator text-only share failed", textErr);
          }
        }
      }

      if (!sharedSuccessfully) {
        // Fallback: Copy to clipboard and open WhatsApp Web/App
        try {
          await navigator.clipboard.writeText(shareText);
        } catch (clipErr) {
          console.error("Clipboard write failed", clipErr);
        }
        setError('📋 تم نسخ نص المنشور بنجاح إلى الحافظة لتعذر مشاركة الملف داخل هذا الإطار، وسيتم فتح واتساب الآن لتسهيل اللصق والمشاركة!');
        
        // Open WhatsApp web or prompt URL
        const encodedText = encodeURIComponent(shareText);
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
      }
    } catch (error) {
      console.error("Sharing failed", error);
      setError('حدث خطأ أثناء محاولة المشاركة.');
    } finally {
      setSharing(false);
    }
  };

  const renderPreviewImage = () => (
    <div className="relative w-full max-w-md mx-auto">
      <div className="aspect-[4/5] bg-brand-olive/5 dark:bg-zinc-900 rounded-[36px] overflow-hidden border border-brand-olive/15 dark:border-zinc-800 relative group shadow-2xl">
        <img 
          src={HERO_PREVIEW_IMAGE} 
          alt="نموذج تصميم بطاقة نور الإسلامية" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-center space-y-2.5">
          <p className="text-[11px] font-bold tracking-wider text-brand-gold">
            نور • استوديو البطاقات الدعوية
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white serif leading-relaxed">
            ﴿ أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ ﴾
          </p>
          <p className="text-xs text-white/80 leading-relaxed">
            تصاميم إيمانية متوازنة التباين وجاهزة للنشر الفوري على فيسبوك وواتساب
          </p>
        </div>
      </div>
      {/* Subtle architectural corner accents */}
      <div className="hidden sm:block absolute -top-5 -right-5 w-20 h-20 border-t-2 border-r-2 border-brand-olive/25 dark:border-brand-gold/30 rounded-tr-3xl pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-5 -left-5 w-20 h-20 border-b-2 border-l-2 border-brand-olive/25 dark:border-brand-gold/30 rounded-bl-3xl pointer-events-none" />
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 selection:bg-brand-olive/20",
      darkMode ? "bg-zinc-950 text-zinc-100" : "bg-brand-cream text-brand-ink"
    )}>
        {/* Header: Clean 3-Zone Top Bar on Desktop, Compact Single-Row on Mobile */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4 sm:gap-8 border-b border-brand-olive/10 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={() => setStep('input')}
            className="flex items-center gap-2.5 shrink-0 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive rounded-xl min-h-[44px]"
          >
            <div className="w-9 h-9 bg-brand-olive rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap">نور</span>
          </button>

          {/* Desktop Navigation (Mobile uses Ergonomic Bottom Tab Bar) */}
          <nav className="hidden md:flex items-center gap-2 text-sm font-bold">
            <button 
              onClick={() => setStep('input')} 
              className={cn(
                "px-3.5 py-2 min-h-[40px] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer",
                (step === 'input' || step === 'preview')
                  ? "bg-brand-olive text-white" 
                  : (darkMode ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-brand-ink/70 hover:text-brand-ink hover:bg-brand-olive/5")
              )}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>الرئيسية</span>
            </button>
            <button 
              onClick={() => setStep('gallery')} 
              className={cn(
                "px-3.5 py-2 min-h-[40px] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer",
                step === 'gallery'
                  ? "bg-brand-olive text-white" 
                  : (darkMode ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-brand-ink/70 hover:text-brand-ink hover:bg-brand-olive/5")
              )}
            >
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              <span>المعرض</span>
            </button>
            <button 
              onClick={() => setStep('search')} 
              className={cn(
                "px-3.5 py-2 min-h-[40px] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer",
                step === 'search'
                  ? "bg-brand-olive text-white" 
                  : (darkMode ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-brand-ink/70 hover:text-brand-ink hover:bg-brand-olive/5")
              )}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>البحث القرآني</span>
            </button>
            <button 
              onClick={() => setStep('history')} 
              className={cn(
                "px-3.5 py-2 min-h-[40px] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer",
                step === 'history'
                  ? "bg-brand-olive text-white" 
                  : (darkMode ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-brand-ink/70 hover:text-brand-ink hover:bg-brand-olive/5")
              )}
            >
              <HistoryIcon className="w-3.5 h-3.5 shrink-0" />
              <span>السجل{postHistory.length > 0 ? ` (${postHistory.length})` : ''}</span>
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {post && step !== 'preview' && (
              <button
                type="button"
                onClick={() => setStep('preview')}
                className="md:hidden px-3 py-2 min-h-[44px] rounded-xl bg-brand-olive text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>بطاقتي</span>
              </button>
            )}
            <PWAInstallButton
              darkMode={darkMode}
              variant="header"
              onInstalled={() => showToast('تم تثبيت تطبيق نور على جهازك بنجاح')}
            />
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className={cn(
                "relative h-11 px-3 sm:px-3.5 rounded-xl transition-colors border flex items-center justify-center gap-1.5 shrink-0 cursor-pointer text-xs font-bold",
                darkMode
                  ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:border-brand-gold/50"
                  : "bg-white border-brand-olive/15 text-brand-olive hover:bg-brand-cream"
              )}
              title="الإعدادات: الوضع الليلي ومفاتيح الذكاء الاصطناعي وتثبيت التطبيق"
              aria-label="الإعدادات"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">الإعدادات</span>
              {customAiKeyCount > 0 && (
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 left-2"
                  title={`${customAiKeyCount} مفتاح ذكاء اصطناعي نشط`}
                />
              )}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3.5 sm:px-8 py-5 sm:py-12 pb-24 md:pb-16">
          <AnimatePresence mode="wait">
            {step === 'gallery' ? (
              <GalleryView
                darkMode={darkMode}
                activeImageUrl={imageUrl}
                activeManuscriptId={activeManuscriptId}
                aspectRatio={aspectRatio}
                onChangeAspectRatio={setAspectRatio}
                hasActivePost={Boolean(post)}
                onSelectArtworkForDesign={handleSelectArtworkFromGallery}
                onSelectManuscriptForDesign={handleSelectManuscriptFromGallery}
              />
            ) : step === 'input' ? (
              <motion.div
                key="input-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center"
              >
                <div className="space-y-5 sm:space-y-8">
                  <div className="space-y-2.5 sm:space-y-4 flex flex-col items-center lg:items-start text-center lg:text-right">
                    <span className="text-xs font-bold tracking-wider text-brand-olive dark:text-brand-gold">
                      صانع الخواطر والبطاقات الإيمانية
                    </span>
                    <h2 className="text-2xl sm:text-5xl font-bold leading-snug tracking-tight serif text-balance">
                      اصنع أثراً بلمسة ذكاء وبلاغة
                    </h2>
                    <p className="text-xs sm:text-base leading-relaxed text-brand-ink/70 dark:text-zinc-400 max-w-lg">
                      حوّل أفكارك الإيمانية إلى خواطر عميقة وبطاقات وفيديوهات صوتية بتلاوة كبار القراء جاهزة للنشر في ثوانٍ.
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={cn(
                          "p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm flex flex-col gap-2 border",
                          (error.includes('تنبيه') || error.includes('💡') || error.includes('📋'))
                            ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300"
                            : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300"
                        )}
                      >
                        <p>{error}</p>
                      </motion.div>
                    )}

                    {/* Topic Input + Category Controls (Stacked cleanly on mobile, inline on sm+) */}
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && topic.trim() && !generating) {
                                handleGenerate();
                              }
                            }}
                            placeholder="اكتب موضوع خاطرتك الإيمانية اليوم..."
                            className={cn(
                              "w-full border rounded-xl px-4 py-3.5 min-h-[48px] text-base focus:outline-none focus:ring-2 transition-all",
                              darkMode 
                                ? "bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-brand-olive/40" 
                                : "bg-white border-brand-olive/20 text-brand-ink placeholder:text-brand-ink/45 focus:ring-brand-olive/20"
                            )}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            value={selectedCategory}
                            onChange={(e) => {
                              const newCategory = e.target.value;
                              setSelectedCategory(newCategory);
                              loadSuggestions(newCategory);
                            }}
                            aria-label="تصنيف الخاطرة"
                            className={cn(
                              "flex-1 sm:flex-none sm:max-w-[175px] text-xs sm:text-sm font-semibold border rounded-xl px-3 py-3 min-h-[48px] focus:outline-none cursor-pointer transition-colors shadow-sm",
                              darkMode 
                                ? "bg-zinc-900 border-zinc-800 text-white hover:border-brand-olive/50" 
                                : "bg-white border-brand-olive/15 text-brand-ink hover:border-brand-olive/30"
                            )}
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <button 
                            type="button"
                            onClick={() => loadSuggestions(selectedCategory, true)}
                            disabled={loadingSuggestions}
                            title="توليد مواضيع إيمانية جديدة"
                            aria-label="تحديث المواضيع المقترحة"
                            className={cn(
                              "px-3.5 min-h-[48px] min-w-[48px] border rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer",
                              darkMode 
                                ? "bg-zinc-900 border-zinc-800 text-brand-gold hover:bg-zinc-800" 
                                : "bg-white border-brand-olive/15 text-brand-olive hover:bg-brand-olive hover:text-white"
                            )}
                          >
                            <RefreshCw className={cn("w-4 h-4", loadingSuggestions && "animate-spin")} />
                            <span className="text-xs font-bold sm:hidden">تحديث</span>
                          </button>
                        </div>
                      </div>

                      {/* Category-Specific Editorial Narration & Supporting Citations Preview */}
                      <div className={cn(
                        "rounded-xl border px-3.5 py-2.5 text-right space-y-1 transition-colors",
                        darkMode
                          ? "bg-zinc-900/70 border-zinc-800/90"
                          : "bg-white/80 border-brand-olive/15"
                      )}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[11px] sm:text-xs font-bold text-brand-olive dark:text-brand-gold flex items-center gap-1.5">
                            <Feather className="w-3.5 h-3.5 shrink-0" />
                            <span>أسلوب السرد: {activeEditorialProfile.narrationStyleName}</span>
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-medium text-brand-ink/55 dark:text-zinc-400">
                            {activeEditorialProfile.citationFocusSummary}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs leading-relaxed text-brand-ink/70 dark:text-zinc-300">
                          {activeEditorialProfile.narrationSummary}
                        </p>
                      </div>
                    </div>

                    {/* Swipeable Topic Suggestions on Mobile, Tidy Grid on Desktop */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-brand-ink/55 dark:text-zinc-400">
                        مقترحات إيمانية ملهمة (اضغط للاختيار):
                      </p>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 pb-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2">
                        {suggestions.slice(0, 6).map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setTopic(s)}
                            className={cn(
                              "min-w-[235px] max-w-[260px] shrink-0 sm:min-w-0 sm:max-w-none px-3.5 py-3 min-h-[46px] border rounded-xl text-xs sm:text-sm font-medium transition-all text-right leading-snug cursor-pointer",
                              topic === s
                                ? "bg-brand-olive text-white border-brand-olive shadow-sm"
                                : darkMode 
                                  ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-brand-gold/50" 
                                  : "bg-white border-brand-olive/15 text-brand-ink/85 hover:bg-brand-olive hover:text-white"
                            )}
                          >
                            <span className="line-clamp-2 sm:line-clamp-1">{s}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Settings Grid (2x2 on Mobile, 4 cols on sm+) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <select 
                        value={postTone}
                        onChange={(e) => setPostTone(e.target.value as PostTone)}
                        aria-label="نبرة وأسلوب النص"
                        className={cn(
                          "border rounded-xl px-2.5 py-3 min-h-[46px] text-xs font-semibold focus:outline-none shadow-sm cursor-pointer",
                          darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-brand-olive/15 text-brand-ink"
                        )}
                      >
                        {(Object.keys(TONE_LABELS) as PostTone[]).map(toneKey => (
                          <option key={toneKey} value={toneKey}>أسلوب: {TONE_LABELS[toneKey]}</option>
                        ))}
                      </select>
                      <select 
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                        aria-label="نسبة أبعاد الصورة"
                        className={cn(
                          "border rounded-xl px-2.5 py-3 min-h-[46px] text-xs font-semibold focus:outline-none shadow-sm cursor-pointer",
                          darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-brand-olive/15 text-brand-ink"
                        )}
                      >
                        {ASPECT_RATIOS.map(r => <option key={r} value={r}>{ASPECT_RATIO_LABELS[r]}</option>)}
                      </select>
                      <select 
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as Theme)}
                        aria-label="نمط المشهد البصري"
                        className={cn(
                          "border rounded-xl px-2.5 py-3 min-h-[46px] text-xs font-semibold focus:outline-none shadow-sm cursor-pointer",
                          darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-brand-olive/15 text-brand-ink"
                        )}
                      >
                        {THEMES.map(t => <option key={t} value={t}>{THEME_LABELS[t]}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsSeriesMode(!isSeriesMode)}
                        className={cn(
                          "py-3 px-2.5 min-h-[46px] border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm whitespace-nowrap cursor-pointer",
                          isSeriesMode 
                            ? "bg-brand-olive text-white border-brand-olive" 
                            : (darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700" : "bg-white border-brand-olive/15 text-brand-ink/75 hover:border-brand-olive/40")
                        )}
                      >
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <span>{isSeriesMode ? 'سلسلة (3 أجزاء)' : 'منشور فردي'}</span>
                      </button>
                    </div>

                    <div className={cn(
                      "flex items-center gap-2.5 px-3.5 py-3 min-h-[46px] rounded-xl border transition-colors select-none",
                      darkMode ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-brand-olive/10"
                    )}>
                      <input 
                        type="checkbox"
                        id="autoGenerateImageCheckbox"
                        checked={autoGenerateImage}
                        onChange={(e) => setAutoGenerateImage(e.target.checked)}
                        className="w-4 h-4 text-brand-olive focus:ring-brand-olive border-brand-olive/20 rounded cursor-pointer accent-brand-olive"
                      />
                      <label 
                        htmlFor="autoGenerateImageCheckbox" 
                        className="text-xs sm:text-sm font-medium cursor-pointer"
                      >
                        توليد صورة بصرية مخصصة تلقائياً مع النص
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={generating || !topic.trim()}
                      className="w-full py-4 min-h-[54px] bg-brand-olive text-white rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-brand-olive/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                          <span>جاري صياغة الخاطرة واللوحة...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span>توليد الخاطرة والمنشور</span>
                        </>
                      )}
                    </button>

                    {dailyDhikr && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "p-4 sm:p-5 border rounded-2xl flex flex-col sm:flex-row items-center justify-between text-center sm:text-right gap-3",
                          darkMode 
                            ? "bg-zinc-900 border-zinc-800" 
                            : "bg-brand-olive/5 border-brand-olive/15"
                        )}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-brand-olive dark:text-brand-gold">
                            <Calendar className="w-3.5 h-3.5" />
                            <p className="text-[11px] font-bold tracking-wide">ذكر اليوم</p>
                          </div>
                          <p className="text-base sm:text-lg font-medium serif leading-relaxed">{dailyDhikr}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setTopic(dailyDhikr)}
                          className={cn(
                            "px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer",
                            darkMode ? "bg-zinc-800 text-zinc-200 hover:bg-brand-olive hover:text-white" : "bg-white text-brand-olive border border-brand-olive/15 hover:bg-brand-olive hover:text-white"
                          )}
                          title="استخدام هذا الذكر كموضوع للمنشور"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>صمّم بطاقة للذكر</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block">
                  {renderPreviewImage()}
                </div>

                {/* Curated Islamic Gallery Showcase Strip — Swipeable on Mobile, 6-Card Grid on Desktop */}
                <div className="lg:col-span-2 pt-6 sm:pt-8 border-t border-brand-olive/10 dark:border-zinc-800 space-y-4 sm:space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-brand-olive dark:text-brand-gold tabular-nums">
                        المعرض البصري الموسّع · {LOCAL_ISLAMIC_ARTWORKS.length} لوحة ومشهداً إيمانياً حصرياً
                      </p>
                      <h3 className="text-lg sm:text-2xl font-bold serif">
                        ابدأ التصميم مباشرة من لوحات نور الإيمانية
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('gallery')}
                      className={cn(
                        "px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold border transition-colors flex items-center justify-center gap-2 self-stretch sm:self-auto whitespace-nowrap shrink-0 cursor-pointer",
                        darkMode
                          ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-brand-gold hover:text-brand-gold"
                          : "bg-white border-brand-olive/20 text-brand-olive hover:bg-brand-olive hover:text-white"
                      )}
                    >
                      <ImageIcon className="w-4 h-4 shrink-0" />
                      <span>تصفح جميع اللوحات ({LOCAL_ISLAMIC_ARTWORKS.length})</span>
                    </button>
                  </div>

                  <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 pb-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
                    {[
                      LOCAL_ISLAMIC_ARTWORKS[0],
                      LOCAL_ISLAMIC_ARTWORKS[1],
                      LOCAL_ISLAMIC_ARTWORKS[11],
                      LOCAL_ISLAMIC_ARTWORKS[13],
                      LOCAL_ISLAMIC_ARTWORKS[16],
                      LOCAL_ISLAMIC_ARTWORKS[20],
                    ]
                      .filter(Boolean)
                      .map((art) => (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => handleSelectArtworkFromGallery(art.src, art.label)}
                          className="group relative w-[160px] sm:w-auto shrink-0 aspect-square rounded-2xl overflow-hidden border border-brand-olive/15 dark:border-zinc-800 text-right cursor-pointer"
                        >
                          <img
                            src={art.src}
                            alt={art.label}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-3 space-y-0.5">
                            <p className="text-[10px] font-medium text-white/75 truncate">{art.categoryLabel}</p>
                            <p className="text-xs sm:text-sm font-bold text-white serif leading-snug line-clamp-2">{art.label}</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </motion.div>
            ) : step === 'preview' ? (
              <motion.div
                key="preview-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <button 
                      onClick={() => setStep('input')}
                      className={cn(
                        "flex items-center gap-1.5 transition-colors font-bold text-xs sm:text-sm px-3 py-2 rounded-xl min-h-[44px] self-start cursor-pointer",
                        darkMode ? "text-zinc-300 hover:text-white hover:bg-zinc-900" : "text-brand-ink/75 hover:text-brand-ink hover:bg-white/70"
                      )}
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>العودة للرئيسية</span>
                    </button>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap">
                      <button
                        onClick={() => {
                          stopPreviewAudio();
                          if (!imageUrl) {
                            setImageUrl(getLocalFallbackImage(post?.topic || 'قرآن'));
                          }
                          setIsVideoStudioOpen(true);
                        }}
                        disabled={!post}
                        title="تصدير المنشور كفيديو عالي الدقة مع صوت قارئ مميز"
                        className="px-3.5 py-2.5 min-h-[44px] border rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-xs font-bold cursor-pointer bg-brand-olive text-white border-brand-olive hover:bg-brand-olive/90 shadow-md shadow-brand-olive/20 whitespace-nowrap shrink-0"
                      >
                        <Film className="w-4 h-4 text-brand-gold shrink-0" />
                        <span>فيديو بالصوت</span>
                      </button>
                      {post?.verseText && (
                        <button
                          onClick={() => playAudio(post.verseText || '')}
                          className={cn(
                            "px-3.5 py-2.5 min-h-[44px] border rounded-xl transition-all flex items-center gap-2 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0",
                            isPlaying
                              ? "bg-red-600 text-white border-red-600"
                              : darkMode
                                ? "bg-zinc-900 border-zinc-800 text-brand-gold hover:bg-zinc-800"
                                : "bg-white border-brand-olive/15 text-brand-olive hover:bg-brand-olive hover:text-white"
                          )}
                          title={`الاستماع للتلاوة بصوت ${getReciterById(selectedReciter).name}`}
                        >
                          {isAudioLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          ) : isPlaying ? (
                            <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                          ) : (
                            <Volume2 className="w-4 h-4 shrink-0" />
                          )}
                          <span>
                            {isAudioLoading ? 'تحميل...' : isPlaying ? 'إيقاف' : 'تلاوة'}
                          </span>
                        </button>
                      )}
                      {post && (post.content?.trim() || activeCitation?.text?.trim()) && (
                        <button
                          type="button"
                          onClick={playReflectionAndCitation}
                          className={cn(
                            "px-3.5 py-2.5 min-h-[44px] border rounded-xl transition-all flex items-center gap-2 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0",
                            isNarrationPlaying
                              ? "bg-red-600 text-white border-red-600"
                              : darkMode
                                ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-brand-gold/60 hover:text-brand-gold"
                                : "bg-white border-brand-olive/15 text-brand-olive hover:bg-brand-olive hover:text-white"
                          )}
                          title="قراءة الخاطرة الإيمانية مع الشاهد الداعم بصوت روحاني هادئ"
                        >
                          {isNarrationLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          ) : isNarrationPlaying ? (
                            <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                          ) : (
                            <Headphones className="w-4 h-4 shrink-0" />
                          )}
                          <span>
                            {isNarrationLoading
                              ? 'تجهيز الصوت...'
                              : isNarrationPlaying
                                ? 'إيقاف القراءة'
                                : showSupportingCitationOnCard && activeCitation
                                  ? 'قراءة النص والشاهد'
                                  : 'قراءة النص'}
                          </span>
                        </button>
                      )}
                      <button 
                        onClick={() => openVerticalImageStudio('whatsapp-9x16')}
                        disabled={!post}
                        title="تصدير صورة عمودية احترافية (واتساب 9:16 · فيسبوك 4:5)"
                        className={cn(
                          "px-3.5 py-2.5 min-h-[44px] border rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0",
                          darkMode ? "bg-brand-gold text-zinc-950 border-brand-gold hover:bg-brand-gold/90" : "bg-brand-gold text-zinc-950 border-brand-gold hover:bg-brand-gold/90 shadow-sm"
                        )}
                      >
                        <Download className="w-4 h-4 shrink-0" />
                        <span>صورة عمودية</span>
                      </button>
                      <button 
                        onClick={handleWhatsAppShare}
                        disabled={sharing || !post}
                        title="مشاركة على واتساب"
                        className={cn(
                          "px-3.5 py-2.5 min-h-[44px] border rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0",
                          darkMode ? "bg-emerald-700 border-emerald-600 text-white hover:bg-emerald-600" : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                        )}
                      >
                        {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                        <span>واتساب</span>
                      </button>
                      <button
                        onClick={handleCopyFacebookCaption}
                        disabled={!post}
                        className={cn(
                          "px-3 py-2.5 min-h-[44px] border rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0",
                          copyFeedback === 'post-caption'
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : (darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800" : "bg-white border-brand-olive/15 text-brand-olive hover:bg-brand-olive hover:text-white")
                        )}
                        title="نسخ النص مع الآية والهاشتاجات للنشر"
                      >
                        {copyFeedback === 'post-caption' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copyFeedback === 'post-caption' ? 'نُسخ' : 'نسخ'}</span>
                      </button>
                      {imageUrl && (
                        <button 
                          onClick={handleGenerateImageOnly}
                          disabled={generatingImage}
                          className={cn(
                            "p-2.5 min-h-[44px] min-w-[44px] border rounded-xl transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer shrink-0",
                            darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white border-brand-olive/15 text-brand-olive hover:bg-brand-olive hover:text-white"
                          )}
                          title="إعادة توليد الصورة بالذكاء الاصطناعي"
                        >
                          <RefreshCw className={cn("w-4 h-4", generatingImage && "animate-spin")} />
                        </button>
                      )}
                    </div>
                  </div>

                  {toastMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 font-semibold"
                    >
                      <p>{toastMessage}</p>
                      <button
                        onClick={() => setToastMessage(null)}
                        className="px-2 py-1 text-xs font-bold opacity-60 hover:opacity-100 shrink-0"
                        aria-label="إغلاق الإشعار"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 border",
                        (error.includes('تنبيه') || error.includes('💡') || error.includes('📋'))
                          ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300"
                          : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300"
                      )}
                    >
                      <p>{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="px-2 py-1 text-xs font-bold opacity-60 hover:opacity-100 shrink-0"
                        aria-label="إغلاق التنبيه"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Responsive Card-First 2-Column Studio (Mobile: Card First -> Controls Below; Desktop: Side-by-Side) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  {/* Controls Column (Order 2 on mobile so the card appears FIRST, Order 2 on desktop right/left split) */}
                  <div className="lg:col-span-6 order-2 space-y-4">
                    {/* AI Content Refinement Bar */}
                    {post && (
                      <div className={cn(
                        "p-3.5 sm:p-4 rounded-2xl border space-y-2.5",
                        darkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-brand-olive/15"
                      )}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-xs font-bold text-brand-olive dark:text-brand-gold">
                            <Wand2 className="w-4 h-4 shrink-0" />
                            <span>ارتقِ بقوة وبلاغة الخاطرة بلمسة واحدة:</span>
                          </div>
                          {post.narrationStyle && (
                            <span className="text-[11px] font-medium text-brand-ink/60 dark:text-zinc-400">
                              {post.category ? `${post.category} · ` : ''}{post.narrationStyle}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                          {(
                            [
                              { id: 'deepen', label: 'تعميق وإبداع أدبي' },
                              { id: 'enrich_citations', label: 'إثراء بالشواهد' },
                              { id: 'polish', label: 'تجميل وبلاغة' },
                              { id: 'add_dua', label: 'إضافة دعاء ختامي' },
                              { id: 'shorten', label: 'تقصير وتكثيف' },
                            ] as { id: RefineAction; label: string }[]
                          ).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleRefinePost(item.id)}
                              disabled={refining !== null}
                              className={cn(
                                "px-3 py-2 min-h-[42px] rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer",
                                item.id === 'deepen'
                                  ? "bg-brand-olive text-white border-brand-olive hover:bg-brand-olive/90"
                                  : darkMode
                                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-brand-gold hover:text-brand-gold"
                                    : "bg-brand-cream/40 border-brand-olive/15 text-brand-ink hover:bg-brand-olive hover:text-white"
                              )}
                            >
                              {refining === item.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Supporting Multi-Source Citations Switcher (Hadith · Arabic Poetry · Islamic Wisdom) */}
                    {post && (
                      <div className={cn(
                        "p-3.5 sm:p-4 rounded-2xl border space-y-3",
                        darkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-brand-olive/15"
                      )}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-xs font-bold text-brand-olive dark:text-brand-gold">
                            <Quote className="w-4 h-4 shrink-0" />
                            <span>الشواهد الداعمة للموضوع (حديث · شعر · حكمة)</span>
                          </div>
                          {activeCitations.length > 0 && (
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <button
                                type="button"
                                onClick={playReflectionAndCitation}
                                className={cn(
                                  "px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors",
                                  isNarrationPlaying
                                    ? "bg-red-600 text-white border-red-600"
                                    : darkMode
                                      ? "bg-zinc-950 border-zinc-800 text-brand-gold hover:border-brand-gold/50"
                                      : "bg-brand-cream/40 border-brand-olive/20 text-brand-olive hover:bg-brand-olive hover:text-white"
                                )}
                              >
                                {isNarrationLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : isNarrationPlaying ? (
                                  <Square className="w-3 h-3 fill-current" />
                                ) : (
                                  <Headphones className="w-3.5 h-3.5" />
                                )}
                                <span>{isNarrationPlaying ? 'إيقاف' : 'استماع للنص والشاهد'}</span>
                              </button>
                              <label className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer text-brand-ink/75 dark:text-zinc-300">
                                <input
                                  type="checkbox"
                                  checked={showSupportingCitationOnCard}
                                  onChange={(e) => setShowSupportingCitationOnCard(e.target.checked)}
                                  className="w-4 h-4 accent-brand-olive"
                                />
                                <span>عرض الشاهد على البطاقة</span>
                              </label>
                            </div>
                          )}
                        </div>

                        {activeCitations.length > 0 ? (
                          <div className="space-y-2">
                            {activeCitations.map((citation, idx) => {
                              const isSelected = idx === safeCitationIndex && showSupportingCitationOnCard;
                              const poetryParts =
                                citation.type === 'poetry' && citation.text.includes('/')
                                  ? citation.text.split('/').map((s) => s.trim()).filter(Boolean)
                                  : null;
                              return (
                                <button
                                  key={`${citation.type}-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setActiveCitationIndex(idx);
                                    setShowSupportingCitationOnCard(true);
                                  }}
                                  className={cn(
                                    "w-full text-right p-3 rounded-xl border transition-all space-y-1 cursor-pointer min-h-[44px]",
                                    isSelected
                                      ? darkMode
                                        ? "bg-brand-gold/10 border-brand-gold/60"
                                        : "bg-brand-olive/5 border-brand-olive/50"
                                      : darkMode
                                        ? "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                                        : "bg-brand-cream/25 border-brand-olive/10 hover:border-brand-olive/30"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold text-brand-olive dark:text-brand-gold">
                                      {citation.label || CITATION_TYPE_LABELS[citation.type]}
                                      {citation.prefix ? ` · ${citation.prefix}` : ''}
                                    </span>
                                    {isSelected && (
                                      <span className="text-[10px] font-bold text-brand-olive dark:text-brand-gold flex items-center gap-1 shrink-0">
                                        <Check className="w-3 h-3" />
                                        معروض على البطاقة
                                      </span>
                                    )}
                                  </div>
                                  {poetryParts && poetryParts.length >= 2 ? (
                                    <div className="text-xs sm:text-sm font-medium leading-relaxed text-brand-ink dark:text-zinc-100 space-y-0.5 pt-0.5">
                                      <p>{poetryParts[0]}</p>
                                      <p className="opacity-90">{poetryParts.slice(1).join(' — ')}</p>
                                    </div>
                                  ) : (
                                    <p className="text-xs sm:text-sm leading-relaxed text-brand-ink/90 dark:text-zinc-200">
                                      {citation.text}
                                    </p>
                                  )}
                                  {citation.source && (
                                    <p className="text-[10px] sm:text-[11px] text-brand-ink/55 dark:text-zinc-400">
                                      {citation.source}
                                    </p>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                            <p className="text-xs text-brand-ink/65 dark:text-zinc-400">
                              أضف أحاديث نبوية وأبيات شعر وحكماً مأثورة تدعم موضوع هذا المنشور.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                const fallbackCitations = getDefaultCitationsForCategory(post.category || selectedCategory);
                                setPost({ ...post, citations: fallbackCitations });
                                setActiveCitationIndex(0);
                                setShowSupportingCitationOnCard(true);
                                showToast('✨ تم إرفاق الشواهد الداعمة للموضوع');
                              }}
                              className="px-3 py-2 min-h-[40px] rounded-xl text-xs font-bold bg-brand-olive text-white hover:bg-brand-olive/90 transition-colors shrink-0 cursor-pointer"
                            >
                              إرفاق شواهد من الأرشيف
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Organized 4-Tab Visual Design & Text Studio Panel (Compact & Thumb-Friendly on Mobile) */}
                    <div className={cn(
                      "p-4 sm:p-6 border rounded-3xl shadow-sm space-y-5",
                      darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-brand-olive/15"
                    )}>
                      {/* Studio Control Tabs */}
                      <div className={cn(
                        "flex items-center gap-1 p-1 rounded-2xl overflow-x-auto no-scrollbar",
                        darkMode ? "bg-zinc-950" : "bg-brand-cream/60"
                      )}>
                        {(
                          [
                            { id: 'style', label: 'التنسيق والخط' },
                            { id: 'edit', label: 'تعديل النص' },
                            { id: 'artworks', label: `اللوحات (${LOCAL_ISLAMIC_ARTWORKS.length})` },
                            { id: 'contrast', label: 'مستشعر التباين' },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStudioControlTab(tab.id)}
                            className={cn(
                              "flex-1 min-w-fit py-2.5 px-2.5 sm:px-3 min-h-[42px] rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1",
                              studioControlTab === tab.id
                                ? "bg-brand-olive text-white shadow-sm"
                                : darkMode
                                  ? "text-zinc-400 hover:text-white"
                                  : "text-brand-ink/70 hover:text-brand-ink"
                            )}
                          >
                            {tab.id === 'edit' && <Edit3 className="w-3.5 h-3.5 shrink-0" />}
                            <span>{tab.label}</span>
                          </button>
                        ))}
                      </div>

                      {studioControlTab === 'edit' && post && (
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between border-b border-brand-olive/10 dark:border-zinc-800 pb-2.5">
                            <span className="text-xs font-bold text-brand-olive dark:text-brand-gold">تعديل النصوص يدوياً</span>
                            <button
                              type="button"
                              onClick={() => setStudioControlTab('style')}
                              className="text-xs font-bold opacity-70 hover:opacity-100 px-2 py-1 cursor-pointer"
                            >
                              العودة للتنسيق
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold opacity-70">العنوان</label>
                              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer select-none">
                                <input type="checkbox" checked={showTopic} onChange={(e) => setShowTopic(e.target.checked)} className="w-4 h-4 accent-brand-olive" />
                                <span>عرض العنوان</span>
                              </label>
                            </div>
                            <input
                              type="text"
                              value={post.topic}
                              onChange={(e) => setPost({ ...post, topic: e.target.value })}
                              className={cn(
                                "w-full p-3 border rounded-xl text-base sm:text-sm focus:outline-none",
                                darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/30 border-brand-olive/15"
                              )}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold opacity-70">نص الخاطرة</label>
                              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={showReflection}
                                  onChange={(e) => setShowReflection(e.target.checked)}
                                  className="w-4 h-4 accent-brand-olive"
                                />
                                <span>عرض الخاطرة</span>
                              </label>
                            </div>
                            <textarea
                              value={post.content}
                              onChange={(e) => setPost({ ...post, content: e.target.value })}
                              rows={4}
                              className={cn(
                                "w-full p-3 border rounded-xl text-base sm:text-sm focus:outline-none resize-none",
                                darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/30 border-brand-olive/15"
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold opacity-70">مقدمة الآية / الحديث</label>
                                <input type="checkbox" checked={showVersePrefixInText} onChange={(e) => setShowVersePrefixInText(e.target.checked)} className="w-4 h-4 accent-brand-olive" />
                              </div>
                              <input
                                type="text"
                                value={post.versePrefix || 'قال تعالى:'}
                                onChange={(e) => setPost({ ...post, versePrefix: e.target.value })}
                                className={cn(
                                  "w-full p-2.5 border rounded-xl text-base sm:text-sm focus:outline-none",
                                  darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/30 border-brand-olive/15"
                                )}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold opacity-70">مرجع الآية / الحديث</label>
                                <input type="checkbox" checked={showVerseReferenceInText} onChange={(e) => setShowVerseReferenceInText(e.target.checked)} className="w-4 h-4 accent-brand-olive" />
                              </div>
                              <input
                                type="text"
                                value={post.verseReference || ''}
                                onChange={(e) => setPost({ ...post, verseReference: e.target.value })}
                                className={cn(
                                  "w-full p-2.5 border rounded-xl text-base sm:text-sm focus:outline-none",
                                  darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/30 border-brand-olive/15"
                                )}
                                placeholder="مثال: (البقرة : 255)"
                              />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold opacity-70">نص الآية / الحديث</label>
                                <input type="checkbox" checked={showVerseTextInText} onChange={(e) => setShowVerseTextInText(e.target.checked)} className="w-4 h-4 accent-brand-olive" />
                              </div>
                              <input
                                type="text"
                                value={post.verseText || ''}
                                onChange={(e) => setPost({ ...post, verseText: e.target.value })}
                                className={cn(
                                  "w-full p-2.5 border rounded-xl text-base sm:text-sm focus:outline-none",
                                  darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/30 border-brand-olive/15"
                                )}
                              />
                            </div>
                          </div>

                          {activeCitation && (
                            <div className="pt-3 border-t border-brand-olive/10 dark:border-zinc-800 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-brand-olive dark:text-brand-gold">
                                  تعديل الشاهد الداعم ({activeCitation.label})
                                </label>
                                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={showSupportingCitationOnCard}
                                    onChange={(e) => setShowSupportingCitationOnCard(e.target.checked)}
                                    className="w-4 h-4 accent-brand-olive"
                                  />
                                  <span>عرض على البطاقة</span>
                                </label>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <input
                                  type="text"
                                  value={activeCitation.prefix || ''}
                                  onChange={(e) => {
                                    const updated = activeCitations.map((c, i) =>
                                      i === safeCitationIndex ? { ...c, prefix: e.target.value } : c
                                    );
                                    setPost({ ...post, citations: updated });
                                  }}
                                  placeholder="مقدمة الشاهد (مثال: قال رسول الله ﷺ:)"
                                  className={cn(
                                    "w-full p-2.5 border rounded-xl text-base sm:text-sm focus:outline-none",
                                    darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/30 border-brand-olive/15"
                                  )}
                                />
                                <input
                                  type="text"
                                  value={activeCitation.source || ''}
                                  onChange={(e) => {
                                    const updated = activeCitations.map((c, i) =>
                                      i === safeCitationIndex ? { ...c, source: e.target.value } : c
                                    );
                                    setPost({ ...post, citations: updated });
                                  }}
                                  placeholder="المصدر أو القائل"
                                  className={cn(
                                    "w-full p-2.5 border rounded-xl text-base sm:text-sm focus:outline-none",
                                    darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/30 border-brand-olive/15"
                                  )}
                                />
                                <textarea
                                  rows={2}
                                  value={activeCitation.text}
                                  onChange={(e) => {
                                    const updated = activeCitations.map((c, i) =>
                                      i === safeCitationIndex ? { ...c, text: e.target.value } : c
                                    );
                                    setPost({ ...post, citations: updated });
                                  }}
                                  placeholder="نص الشاهد (في الشعر استخدم / للفصل بين الشطرين)"
                                  className={cn(
                                    "w-full p-2.5 border rounded-xl text-base sm:text-sm focus:outline-none resize-none sm:col-span-2",
                                    darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/30 border-brand-olive/15"
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {studioControlTab === 'style' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Font Family Selection */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold block text-brand-olive dark:text-zinc-300">
                              نوع الخط العربي الإسلامي
                            </label>
                            <select 
                              value={fontFamily} 
                              onChange={(e) => setFontFamily(e.target.value)} 
                              className={cn(
                                "w-full p-3 min-h-[46px] border rounded-xl text-xs font-bold focus:outline-none cursor-pointer transition-colors shadow-sm",
                                darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/25 border-brand-olive/15 text-brand-ink"
                              )}
                              style={{ fontFamily: getSelectedFontFamily(fontFamily) }}
                            >
                              {ARABIC_FONTS.map(f => (
                                <option key={f.id} value={f.id} style={{ fontFamily: f.family }}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Layout Template Selection */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold block text-brand-olive dark:text-zinc-300">
                              قالب تصميم المنشور
                            </label>
                            <select 
                              value={layoutTemplate} 
                              onChange={(e) => setLayoutTemplate(e.target.value as any)} 
                              className={cn(
                                "w-full p-3 min-h-[46px] border rounded-xl text-xs font-bold focus:outline-none cursor-pointer transition-colors shadow-sm",
                                darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/25 border-brand-olive/15 text-brand-ink"
                              )}
                            >
                              <option value="standard">الافتراضي (النص أسفل الصورة)</option>
                              <option value="overlay">الملصق الشامل (دمج النص فوق الصورة)</option>
                              <option value="card">البطاقة المؤطرة (تصميم بارز وعصري)</option>
                              <option value="split">تصميم منقسم (ثنائية فنية)</option>
                            </select>
                          </div>

                          {/* Font Size Selection */}
                          <div className="space-y-2 flex flex-col justify-center">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-brand-olive dark:text-zinc-300">
                                حجم خط الآية الكريمة
                              </label>
                              <span className="text-xs font-bold font-mono tabular-nums text-brand-olive dark:text-brand-gold">{fontSize}px</span>
                            </div>
                            <input 
                              type="range" 
                              min="16" 
                              max="64" 
                              value={fontSize} 
                              onChange={(e) => setFontSize(Number(e.target.value))} 
                              className="w-full h-2 bg-brand-olive/15 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-olive dark:accent-brand-gold"
                            />
                          </div>

                          {/* Show Verse On Image Checkbox */}
                          <div className="flex flex-col justify-center">
                            <label className={cn(
                              "flex items-center gap-3 p-3 min-h-[46px] rounded-xl border transition-all cursor-pointer select-none",
                              darkMode ? "bg-zinc-950/60 border-zinc-800 hover:bg-zinc-900" : "bg-brand-cream/20 border-brand-olive/10 hover:bg-brand-cream/40"
                            )}>
                              <input 
                                type="checkbox" 
                                checked={showVerseOnImage} 
                                onChange={(e) => setShowVerseOnImage(e.target.checked)} 
                                className="w-4 h-4 text-brand-olive focus:ring-brand-olive border-brand-olive/20 rounded cursor-pointer accent-brand-olive"
                              />
                              <span className="text-xs font-semibold">كتابة الآية على الصورة مباشرة</span>
                            </label>
                          </div>

                          {/* Page Signature */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-zinc-300">
                              <AtSign className="w-3.5 h-3.5" />
                              <span>توقيع صفحتك (اختياري)</span>
                            </label>
                            <input 
                              type="text" 
                              value={pageSignature}
                              onChange={(e) => setPageSignature(e.target.value)}
                              placeholder="مثال: @صفحة_نور"
                              className={cn(
                                "w-full p-3 min-h-[46px] border rounded-xl text-base sm:text-xs font-medium focus:outline-none transition-colors",
                                darkMode ? "bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600" : "bg-brand-cream/25 border-brand-olive/15 text-brand-ink placeholder:text-brand-ink/40"
                              )}
                            />
                          </div>

                          {/* Ornate Frame Option */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-zinc-300">
                              <Frame className="w-3.5 h-3.5" />
                              <span>إطار اللوحة الداخلي</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setCardFrameStyle('clean')}
                                className={cn(
                                  "py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer",
                                  cardFrameStyle === 'clean'
                                    ? "bg-brand-olive text-white border-brand-olive"
                                    : (darkMode ? "bg-zinc-950 border-zinc-800 text-zinc-400" : "bg-brand-cream/20 border-brand-olive/15 text-brand-ink/70")
                                )}
                              >
                                بسيط ونقي
                              </button>
                              <button
                                type="button"
                                onClick={() => setCardFrameStyle('gold-border')}
                                className={cn(
                                  "py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer",
                                  cardFrameStyle === 'gold-border'
                                    ? "bg-brand-gold text-brand-ink border-brand-gold"
                                    : (darkMode ? "bg-zinc-950 border-zinc-800 text-zinc-400" : "bg-brand-cream/20 border-brand-olive/15 text-brand-ink/70")
                                )}
                              >
                                إطار ذهبي
                              </button>
                            </div>
                          </div>

                          {/* Card Accent Color Selection */}
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-zinc-300">
                              <Palette className="w-3.5 h-3.5" />
                              <span>لون العنوان والهوية البصرية</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {CARD_ACCENTS.map((accent) => (
                                <button
                                  key={accent.id}
                                  type="button"
                                  onClick={() => setCardAccentColor(accent.id)}
                                  className={cn(
                                    "py-2 px-3 min-h-[42px] rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer",
                                    cardAccentColor === accent.id
                                      ? "border-brand-olive dark:border-brand-gold ring-2 ring-brand-olive/20"
                                      : (darkMode ? "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700" : "bg-brand-cream/20 border-brand-olive/15 text-brand-ink/80 hover:border-brand-olive/35")
                                  )}
                                >
                                  <span
                                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/15"
                                    style={{ backgroundColor: accent.id }}
                                  />
                                  <span>{accent.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Aspect Ratio & Reciter */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-zinc-300">
                              <Layers className="w-3.5 h-3.5" />
                              <span>مقاس البطاقة والفيديو</span>
                            </label>
                            <div className="grid grid-cols-5 gap-1.5">
                              {ASPECT_RATIOS.map((ratio) => (
                                <button
                                  key={ratio}
                                  type="button"
                                  onClick={() => setAspectRatio(ratio)}
                                  className={cn(
                                    "py-2 min-h-[42px] rounded-xl text-[11px] font-bold border transition-all tabular-nums cursor-pointer",
                                    aspectRatio === ratio
                                      ? "bg-brand-olive text-white border-brand-olive"
                                      : (darkMode ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white" : "bg-brand-cream/20 border-brand-olive/15 text-brand-ink/75 hover:border-brand-olive/40")
                                  )}
                                >
                                  {ratio}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-zinc-300">
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>القارئ المفضل للتلاوة والفيديو</span>
                            </label>
                            <select
                              value={selectedReciter}
                              onChange={(e) => setSelectedReciter(e.target.value)}
                              className={cn(
                                "w-full p-2.5 min-h-[44px] border rounded-xl text-xs font-bold focus:outline-none cursor-pointer transition-colors shadow-sm",
                                darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/25 border-brand-olive/15 text-brand-ink"
                              )}
                            >
                              {QURAN_RECITERS.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {studioControlTab === 'contrast' && (
                        <div className={cn(
                          "p-4 rounded-2xl border transition-all space-y-4 shadow-sm",
                          darkMode ? "bg-zinc-950/60 border-zinc-800" : "bg-brand-cream/15 border-brand-olive/10"
                        )}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-brand-olive/10 dark:border-zinc-800">
                            <div>
                              <h4 className="text-xs font-bold text-brand-ink dark:text-zinc-200">مستشعر التباين الذكي للخط واللون</h4>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">تحليل فوري مدمج لمعايير المقروئية وجمالية التصميم</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">التصحيح التلقائي:</span>
                              <button
                                type="button"
                                onClick={() => setAutoEnhanceContrast(!autoEnhanceContrast)}
                                aria-label="تفعيل أو إيقاف التصحيح التلقائي للتباين"
                                className={cn(
                                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                  autoEnhanceContrast ? "bg-brand-olive dark:bg-brand-gold" : "bg-zinc-300 dark:bg-zinc-700"
                                )}
                              >
                                <span
                                  className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    autoEnhanceContrast ? "-translate-x-5" : "translate-x-0"
                                  )}
                                />
                              </button>
                            </div>
                          </div>

                          {isAnalyzingContrast ? (
                            <div className="py-2 flex items-center gap-2 justify-center text-xs text-brand-olive dark:text-brand-gold">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>جاري قياس تباين الألوان في اللوحة البصرية...</span>
                            </div>
                          ) : (
                            <div className="space-y-3.5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-2.5 rounded-xl border border-dashed border-brand-olive/15 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50">
                                  <span className="text-[10px] block text-zinc-500 dark:text-zinc-400 font-semibold mb-1">قياس شدة السطوع الفعلي</span>
                                  <div className="flex items-center justify-between gap-2 text-xs">
                                    <span className="font-bold tabular-nums text-brand-ink dark:text-zinc-200">
                                      {imageBrightness !== null ? `${imageBrightness} / 255` : 'غير متاح'}
                                    </span>
                                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                      {imageBrightness === null ? 'اختر لوحة' :
                                       imageBrightness > 180 ? 'سطوع مرتفع' :
                                       imageBrightness > 120 ? 'سطوع معتدل' : 'سطوع منخفض'}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-xl border border-dashed border-brand-olive/15 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50">
                                  <span className="text-[10px] block text-zinc-500 dark:text-zinc-400 font-semibold mb-1">نسبة التباين المستشعرة</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold tabular-nums text-brand-ink dark:text-zinc-200">
                                      {getContrastStatus().score}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className={cn(
                                "p-3 rounded-xl border flex gap-2.5 text-xs font-medium leading-relaxed",
                                getContrastStatus().color,
                                getContrastStatus().bg
                              )}>
                                <div className="space-y-1">
                                  <p className="font-bold">
                                    حالة التباين · {getContrastStatus().level}
                                  </p>
                                  <p className="opacity-85 text-[11px] leading-relaxed">
                                    {getContrastStatus().message}
                                  </p>
                                </div>
                              </div>

                              {imageBrightness !== null && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">
                                    <span>لوحة معتمة (تباين فائق)</span>
                                    <span>لوحة مضيئة (تنبيه للتباين)</span>
                                  </div>
                                  <div className="relative w-full h-2 rounded-full overflow-hidden bg-gradient-to-l from-emerald-500 via-amber-400 to-red-500">
                                    <div 
                                      className="absolute top-0 bottom-0 w-1.5 bg-brand-ink dark:bg-white border border-white dark:border-brand-ink transition-all duration-500"
                                      style={{ right: `${(imageBrightness / 255) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {!autoEnhanceContrast ? (
                                <div className="space-y-2 p-2.5 border border-dashed rounded-xl border-brand-olive/15 dark:border-zinc-800 bg-brand-cream/10 dark:bg-zinc-950/30">
                                  <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-brand-ink dark:text-zinc-300">التحكم اليدوي بعتامة التباين:</span>
                                    <span className="font-mono tabular-nums text-brand-olive dark:text-brand-gold">{Math.round(dynamicOverlayOpacity * 100)}%</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="0.10" 
                                    max="0.90" 
                                    step="0.05"
                                    value={dynamicOverlayOpacity} 
                                    onChange={(e) => setDynamicOverlayOpacity(Number(e.target.value))} 
                                    className="w-full h-1.5 bg-brand-olive/15 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-olive dark:accent-brand-gold"
                                  />
                                </div>
                              ) : (
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
                                  مفعل تلقائياً لضبط معايير المقروئية لكل لوحة بشكل مستقل.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {studioControlTab === 'artworks' && (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2.5">
                            <div>
                              <label className="text-xs font-bold block text-brand-olive dark:text-zinc-200">
                                استوديو اللوحات والمشاهد الإيمانية
                              </label>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                                {LOCAL_ISLAMIC_ARTWORKS.length} لوحة حصرية عالية الدقة و{GRADIENT_BACKDROPS.length} خلفيات مخطوطات
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCustomImageUpload}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                  "px-3 py-2 min-h-[40px] rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer",
                                  darkMode
                                    ? "bg-zinc-950 border-zinc-800 text-brand-gold hover:border-brand-gold"
                                    : "bg-brand-cream/40 border-brand-olive/20 text-brand-olive hover:bg-brand-olive hover:text-white"
                                )}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>رفع صورة</span>
                              </button>
                            </div>
                          </div>

                          {/* Studio Mode Tabs */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex gap-1.5">
                              {(
                                [
                                  { id: 'artworks', label: `المعرض (${LOCAL_ISLAMIC_ARTWORKS.length})` },
                                  { id: 'gradients', label: `مخطوطات (${GRADIENT_BACKDROPS.length})` },
                                ] as const
                              ).map((tab) => (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setPresetTab(tab.id)}
                                  className={cn(
                                    "px-3 py-2 min-h-[40px] rounded-xl text-xs font-bold border transition-all cursor-pointer",
                                    presetTab === tab.id
                                      ? "bg-brand-olive text-white border-brand-olive"
                                      : (darkMode ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white" : "bg-brand-cream/20 border-brand-olive/10 text-brand-ink/70 hover:text-brand-ink")
                                  )}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setStep('gallery')}
                              className="text-xs font-bold text-brand-olive dark:text-brand-gold hover:underline cursor-pointer"
                            >
                              المعرض الكامل
                            </button>
                          </div>

                          {presetTab === 'artworks' && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                                {ARTWORK_CATEGORIES.map((cat) => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setStudioArtworkCategory(cat.id)}
                                    className={cn(
                                      "px-3 py-1.5 min-h-[36px] rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0",
                                      studioArtworkCategory === cat.id
                                        ? (darkMode ? "bg-brand-gold text-zinc-950" : "bg-brand-olive/15 text-brand-olive")
                                        : (darkMode ? "bg-zinc-950 text-zinc-400 hover:text-zinc-200" : "bg-brand-cream/30 text-brand-ink/65 hover:text-brand-ink")
                                    )}
                                  >
                                    {cat.label}
                                  </button>
                                ))}
                              </div>

                              <div className="grid grid-cols-3 gap-2.5 p-2.5 border rounded-2xl bg-brand-cream/10 border-brand-olive/10 dark:bg-zinc-950/30 dark:border-zinc-800 max-h-[340px] overflow-y-auto">
                                {(studioArtworkCategory === 'all'
                                  ? LOCAL_ISLAMIC_ARTWORKS
                                  : LOCAL_ISLAMIC_ARTWORKS.filter((art) => art.category === studioArtworkCategory)
                                ).map((art) => (
                                  <button
                                    key={art.id}
                                    type="button"
                                    onClick={() => {
                                      setActiveManuscriptId(null);
                                      setImageUrl(art.src);
                                      setError(null);
                                    }}
                                    className={cn(
                                      "group rounded-xl overflow-hidden border-2 transition-all text-right relative aspect-square cursor-pointer",
                                      imageUrl === art.src && !activeManuscriptId
                                        ? "border-brand-olive dark:border-brand-gold ring-2 ring-brand-olive/20"
                                        : "border-transparent hover:border-brand-olive/35"
                                    )}
                                    title={art.subtitle}
                                  >
                                    <img
                                      src={art.src}
                                      alt={art.label}
                                      referrerPolicy="no-referrer"
                                      loading="lazy"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2 pb-1.5 pt-4 text-white">
                                      <p className="text-[10px] font-bold leading-tight truncate">{art.label}</p>
                                    </div>
                                    {imageUrl === art.src && !activeManuscriptId && (
                                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-olive dark:bg-brand-gold text-white dark:text-zinc-950 flex items-center justify-center shadow">
                                        <Check className="w-3 h-3" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {presetTab === 'gradients' && (
                            <div className="space-y-2.5">
                              <div className={cn(
                                "px-3 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-[11px]",
                                darkMode ? "bg-zinc-950/60 border-zinc-800 text-zinc-300" : "bg-brand-cream/35 border-brand-olive/15 text-brand-ink/80"
                              )}>
                                <span className="font-semibold">
                                  مخطوطات ديناميكية متكيفة مع مقاس <span className="font-bold tabular-nums text-brand-olive dark:text-brand-gold">{aspectRatio}</span> وطول النص
                                </span>
                                <div className="flex items-center gap-1">
                                  {ASPECT_RATIOS.map((ratio) => (
                                    <button
                                      key={ratio}
                                      type="button"
                                      onClick={() => setAspectRatio(ratio)}
                                      className={cn(
                                        "px-2 py-1 rounded-md text-[10px] font-bold tabular-nums transition-colors cursor-pointer",
                                        aspectRatio === ratio
                                          ? "bg-brand-olive text-white"
                                          : darkMode ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-white text-brand-ink/65 hover:text-brand-ink"
                                      )}
                                    >
                                      {ratio}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-2.5 border rounded-2xl bg-brand-cream/10 border-brand-olive/10 dark:bg-zinc-950/30 dark:border-zinc-800 max-h-[340px] overflow-y-auto">
                                {GRADIENT_BACKDROPS.map((backdrop) => {
                                  const isSelected = activeManuscriptId === backdrop.id;
                                  return (
                                    <button
                                      key={backdrop.id}
                                      type="button"
                                      onClick={() => {
                                        const dataUrl = createGradientDataUrl(backdrop, {
                                          aspectRatio,
                                          textLength: getActiveTextLengthOnImage(post),
                                          hasVerse: Boolean(post?.verseText && (showVerseOnImage || layoutTemplate === 'overlay')),
                                          hasFullOverlay: layoutTemplate === 'overlay',
                                          fontSize,
                                        });
                                        setActiveManuscriptId(backdrop.id);
                                        setImageUrl(dataUrl);
                                        setError(null);
                                      }}
                                      className={cn(
                                        "p-3 rounded-xl border transition-all hover:-translate-y-0.5 text-center flex flex-col items-center justify-center gap-1 min-h-[82px] cursor-pointer relative overflow-hidden",
                                        isSelected
                                          ? "border-brand-gold ring-2 ring-brand-gold/40"
                                          : backdrop.isDark ? "text-white border-white/15" : "text-brand-ink border-brand-olive/20"
                                      )}
                                      style={{ background: backdrop.cssGradient, color: backdrop.textColor }}
                                    >
                                      <div
                                        className="absolute inset-1.5 rounded-lg border pointer-events-none"
                                        style={{ borderColor: backdrop.ornamentColor }}
                                      />
                                      {isSelected && (
                                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-gold text-brand-ink flex items-center justify-center z-10">
                                          <Check className="w-2.5 h-2.5" />
                                        </span>
                                      )}
                                      <span className="text-xs font-bold serif relative z-10">{backdrop.name}</span>
                                      <span className="text-[10px] opacity-80 relative z-10 leading-snug">{backdrop.subtitle}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview Card Column (Order 1 — ALWAYS FIRST on mobile, sticky left/right on desktop!) */}
                  <div className="lg:col-span-6 order-1 lg:sticky lg:top-6 space-y-4">
                    {isSeriesMode && seriesPosts.length > 0 && (
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={() => handleSeriesNavigate(currentSeriesIndex - 1)}
                          disabled={currentSeriesIndex === 0 || generating}
                          className={cn(
                            "p-2.5 min-h-[44px] min-w-[44px] border rounded-full disabled:opacity-30 flex items-center justify-center",
                            darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-brand-olive/15"
                          )}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="flex gap-2">
                          {seriesPosts.map((_, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                i === currentSeriesIndex ? "w-6 bg-brand-olive dark:bg-brand-gold" : (darkMode ? "bg-zinc-800" : "bg-brand-olive/20")
                              )}
                            />
                          ))}
                        </div>
                        <button 
                          onClick={() => handleSeriesNavigate(currentSeriesIndex + 1)}
                          disabled={currentSeriesIndex === seriesPosts.length - 1 || generating}
                          className={cn(
                            "p-2.5 min-h-[44px] min-w-[44px] border rounded-full disabled:opacity-30 flex items-center justify-center",
                            darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-brand-olive/15"
                          )}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Unified Preview for Download */}
                  <div 
                    id="post-preview"
                    style={{ 
                      backgroundColor: layoutTemplate === 'overlay' ? '#09090b' : layoutTemplate === 'card' ? '#FAF7F2' : '#ffffff', 
                      color: layoutTemplate === 'overlay' ? '#ffffff' : '#1a1a1a', 
                      borderWidth: cardFrameStyle === 'gold-border' ? '3px' : layoutTemplate === 'card' ? '1px' : '0px', 
                      borderColor: cardFrameStyle === 'gold-border' ? '#D4AF37' : 'rgba(90, 90, 64, 0.15)',
                      borderRadius: '35px',
                      fontFamily: getSelectedFontFamily(fontFamily)
                    }}
                    className={cn(
                      "overflow-hidden shadow-2xl mx-auto w-full border relative",
                      darkMode ? "border-zinc-800" : "border-gray-200/70",
                      layoutTemplate === 'split' ? (
                        aspectRatio === '1:1' || aspectRatio === '16:9' || aspectRatio === '4:3'
                          ? 'flex flex-col md:flex-row items-stretch'
                          : 'flex flex-col'
                      ) : ''
                    )}
                  >
                    {/* Image Section */}
                    <div 
                      id="image-preview"
                      className={cn(
                        "relative overflow-hidden animate-target",
                        layoutTemplate === 'split' ? (
                          aspectRatio === '1:1' || aspectRatio === '16:9' || aspectRatio === '4:3'
                            ? 'w-full md:w-[48%] shrink-0'
                            : 'w-full h-auto'
                        ) : (
                          layoutTemplate === 'card' ? 'm-6 rounded-[24px] shadow-sm' : 'w-full'
                        ),
                        // Layout aspect ratio box
                        aspectRatio === '1:1' ? 'aspect-square' : 
                        aspectRatio === '4:3' ? 'aspect-[4/3]' :
                        aspectRatio === '3:4' ? 'aspect-[3/4]' :
                        aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[9/16]'
                      )}
                    >
                      {!imageUrl ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4" style={{ backgroundColor: '#f9fafb', color: '#1a1a1a' }}>
                          {generatingImage || generating ? (
                            <>
                              <Loader2 className="w-10 h-10 sm:w-12 h-12 animate-spin text-brand-olive" style={{ color: '#5A5A40' }} />
                              <p className="font-semibold animate-pulse text-sm sm:text-base" style={{ color: '#5A5A40' }}>جاري رسم اللوحة الإيمانية بالذكاء الاصطناعي...</p>
                              <p className="text-xs opacity-60">يرجى الانتظار بضع ثوانٍ لتوليد صورة مذهلة تعبّر عن المعنى</p>
                            </>
                          ) : (
                            <>
                              <div className="w-16 h-16 bg-brand-cream/30 rounded-full flex items-center justify-center text-brand-olive shadow-inner" style={{ color: '#5A5A40' }}>
                                <ImageIcon className="w-8 h-8" />
                              </div>
                              <p className="font-bold text-sm sm:text-base" style={{ color: '#5A5A40' }}>لم يتم توليد صورة بعد</p>
                              <p className="text-xs opacity-70 max-w-xs leading-relaxed">
                                اضغط على الزر أدناه لتوليد صورة بصرية مميزة وحصرية للتصميم بالذكاء الاصطناعي.
                              </p>
                              <button
                                onClick={handleGenerateImageOnly}
                                className="px-6 py-3 bg-brand-olive text-white rounded-2xl font-bold text-xs hover:bg-brand-olive/95 transition-all flex items-center gap-1.5 shadow-md shadow-brand-olive/20"
                                style={{ backgroundColor: '#5A5A40' }}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>توليد صورة مخصصة بالذكاء الاصطناعي 🎨</span>
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="relative w-full h-full"
                        >
                          <img 
                            id="post-image"
                            src={imageUrl || ''} 
                            alt="Generated Religious Art" 
                            className="w-full h-full object-cover animate-target"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.warn("Main image load failed, triggering auto fallback");
                              const backup = getFallbackImageUrl(post?.topic || 'default');
                              setImageUrl(backup);
                            }}
                          />
                          {/* Verse Overlay on Image (Standard / Card / Split) */}
                          {post?.verseText && showVerseOnImage && layoutTemplate !== 'overlay' && (() => {
                            const isLightManuscript = Boolean(activeManuscript && !activeManuscript.isDark);
                            const isManuscript = Boolean(activeManuscript);
                            const verseLen = post.verseText.length;
                            const isWideRatio = aspectRatio === '16:9' || aspectRatio === '4:3';
                            const autoScale = isManuscript
                              ? Math.min(
                                  1,
                                  (isWideRatio ? 0.84 : 0.96) *
                                    (verseLen > 140 ? 0.72 : verseLen > 85 ? 0.84 : 1)
                                )
                              : 1;
                            const computedVerseSize = Math.max(15, Math.round(fontSize * autoScale));
                            const computedPrefixSize = Math.max(12, Math.round(computedVerseSize * 0.6));

                            return (
                              <div 
                                className={cn(
                                  "absolute inset-0 flex flex-col items-center text-center transition-all duration-300",
                                  isManuscript
                                    ? (aspectRatio === '16:9'
                                        ? "justify-center px-10 py-6 sm:px-16 sm:py-8"
                                        : "justify-center px-7 py-8 sm:px-12 sm:py-12")
                                    : "justify-end p-2 sm:p-4 pb-4 sm:pb-6"
                                )}
                              >
                                <div 
                                  className={cn(
                                    "rounded-2xl flex flex-col items-center justify-center transition-all duration-300",
                                    isManuscript ? "p-3 sm:p-5 max-w-[88%]" : "p-3 sm:p-5 max-w-[95%]"
                                  )}
                                  style={{ 
                                    backgroundColor: isManuscript
                                      ? 'transparent'
                                      : (autoEnhanceContrast && imageBrightness !== null && imageBrightness > 150)
                                        ? 'rgba(0, 0, 0, 0.45)'
                                        : 'transparent',
                                    backdropFilter: (!isManuscript && autoEnhanceContrast && imageBrightness !== null && imageBrightness > 150) ? 'blur(6px)' : 'none',
                                    border: (!isManuscript && autoEnhanceContrast && imageBrightness !== null && imageBrightness > 150) ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
                                  }}
                                >
                                  <p 
                                    style={{ 
                                      color: isLightManuscript
                                        ? activeManuscript?.accentColor || '#8B6821'
                                        : isManuscript
                                          ? activeManuscript?.accentColor || '#E5C76B'
                                          : 'rgba(255, 255, 255, 0.95)', 
                                      textRendering: 'optimizeLegibility', 
                                      lineHeight: '1.4', 
                                      textAlign: 'center', 
                                      textShadow: isLightManuscript
                                        ? 'none'
                                        : isManuscript
                                          ? '0 2px 8px rgba(0,0,0,0.45)'
                                          : '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.8)',
                                      fontSize: `${computedPrefixSize}px`,
                                      fontFamily: getSelectedFontFamily(fontFamily)
                                    }}
                                    className="font-bold mb-2.5 sm:mb-3.5"
                                  >
                                    {post.versePrefix || 'قال تعالى:'}
                                  </p>
                                  <p 
                                    style={{ 
                                      textRendering: 'optimizeLegibility', 
                                      color: isLightManuscript ? (activeManuscript?.textColor || '#221D15') : '#ffffff', 
                                      lineHeight: verseLen > 110 ? '1.55' : '1.45', 
                                      textAlign: 'center', 
                                      textShadow: isLightManuscript
                                        ? 'none'
                                        : isManuscript
                                          ? '0 2px 12px rgba(0,0,0,0.55)'
                                          : '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 12px rgba(0,0,0,0.9)',
                                      fontSize: `${computedVerseSize}px`,
                                      fontFamily: getSelectedFontFamily(fontFamily)
                                    }}
                                    className="leading-relaxed"
                                  >
                                    {post.verseText}
                                  </p>
                                  {isManuscript && showVerseReferenceInText && (post.verseReference || post.surahName) && (
                                    <p
                                      className="mt-2.5 text-[11px] sm:text-xs font-bold opacity-75"
                                      style={{
                                        color: isLightManuscript ? (activeManuscript?.accentColor || '#8B6821') : (activeManuscript?.accentColor || '#E5C76B'),
                                        fontFamily: getSelectedFontFamily(fontFamily),
                                      }}
                                    >
                                      {post.verseReference || `(${post.surahName} : ${post.verseNumber})`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* IMMERSIVE Glass / Manuscript Overlay Layout - ALL Content rendered directly over the Image */}
                          {layoutTemplate === 'overlay' && post && (() => {
                            const isManuscript = Boolean(activeManuscript);
                            const isLightManuscript = Boolean(activeManuscript && !activeManuscript.isDark);
                            const totalTextLen = getActiveTextLengthOnImage(post);
                            const density = computeManuscriptTextDensity({
                              aspectRatio,
                              textLength: totalTextLen,
                              hasFullOverlay: true,
                              fontSize,
                            });
                            const isWideRatio = aspectRatio === '16:9' || aspectRatio === '4:3';
                            const compactText = density === 'long' || (isWideRatio && density === 'medium');

                            return (
                              <div
                                className={cn(
                                  "absolute inset-0 flex flex-col justify-center items-center transition-all duration-300",
                                  isManuscript
                                    ? (isWideRatio ? "px-9 py-5 sm:px-14 sm:py-7" : "px-6 py-7 sm:px-11 sm:py-11")
                                    : "bg-black/45 justify-end p-4 sm:p-8"
                                )}
                              >
                                <div 
                                  className={cn(
                                    "w-full text-center transition-all duration-300",
                                    isManuscript
                                      ? cn("rounded-2xl max-h-full overflow-y-auto no-scrollbar", compactText ? "p-3 sm:p-5 space-y-2" : "p-4 sm:p-7 space-y-3.5")
                                      : "backdrop-blur-md rounded-[24px] p-5 sm:p-8 space-y-4 shadow-2xl border"
                                  )}
                                  style={{ 
                                    backgroundColor: isManuscript
                                      ? (isLightManuscript ? 'rgba(255, 252, 245, 0.42)' : 'rgba(6, 8, 10, 0.24)')
                                      : `rgba(8, 8, 8, ${getDynamicOverlayOpacity()})`,
                                    borderColor: isManuscript
                                      ? (activeManuscript?.ornamentColor || 'rgba(212, 175, 55, 0.35)')
                                      : cardFrameStyle === 'gold-border' ? 'rgba(212, 175, 55, 0.55)' : 'rgba(255, 255, 255, 0.12)',
                                    borderWidth: isManuscript ? '1px' : undefined,
                                  }}
                                >
                                  {showTopic && (
                                    <h3
                                      className={cn(
                                        "font-bold leading-tight",
                                        compactText ? "text-base sm:text-xl" : "text-lg sm:text-2xl"
                                      )}
                                      style={{
                                        color: isManuscript ? (activeManuscript?.accentColor || '#D4AF37') : '#D4AF37',
                                        fontFamily: getSelectedFontFamily(fontFamily)
                                      }}
                                    >
                                      {post.topic}
                                    </h3>
                                  )}
                                  {showReflection && post.content?.trim() && (
                                    <p
                                      className={cn(
                                        "whitespace-pre-wrap font-medium",
                                        compactText ? "text-xs sm:text-sm leading-relaxed" : "text-sm sm:text-base leading-relaxed"
                                      )}
                                      style={{
                                        color: isLightManuscript ? (activeManuscript?.textColor || '#221D15') : 'rgba(255,255,255,0.95)',
                                        fontFamily: getSelectedFontFamily(fontFamily)
                                      }}
                                    >
                                      {post.content}
                                    </p>
                                  )}
                                  {post.verseText && (showVersePrefixInText || showVerseReferenceInText || showVerseTextInText) && (
                                    <div
                                      className={cn("border-t space-y-1.5", compactText ? "pt-2" : "pt-3")}
                                      style={{
                                        borderColor: isLightManuscript ? 'rgba(115, 92, 46, 0.22)' : 'rgba(255, 255, 255, 0.14)'
                                      }}
                                    >
                                      {showVersePrefixInText && (
                                        <p
                                          className={cn("opacity-85 font-semibold", compactText ? "text-xs" : "text-sm")}
                                          style={{
                                            color: isLightManuscript ? (activeManuscript?.accentColor || '#8B6821') : '#ffffff',
                                            fontFamily: getSelectedFontFamily(fontFamily)
                                          }}
                                        >
                                          {post.versePrefix || 'قال تعالى:'}
                                        </p>
                                      )}
                                      {showVerseTextInText && (
                                        <p 
                                          className={cn(
                                            "cursor-pointer hover:text-brand-gold transition-colors font-bold leading-relaxed",
                                            compactText ? "text-sm sm:text-base" : "text-base sm:text-lg"
                                          )}
                                          style={{
                                            color: isLightManuscript ? (activeManuscript?.textColor || '#221D15') : '#ffffff',
                                            fontFamily: getSelectedFontFamily(fontFamily)
                                          }}
                                          onClick={() => playAudio(post.verseText || '')}
                                        >
                                          {post.verseText}
                                          {isAudioLoading && <Loader2 className="inline w-3.5 h-3.5 ml-2 animate-spin" />}
                                        </p>
                                      )}
                                      {showVerseReferenceInText && (
                                        <p
                                          className="text-[10px] sm:text-xs opacity-70 font-semibold"
                                          style={{
                                            color: isLightManuscript ? (activeManuscript?.accentColor || '#8B6821') : '#ffffff',
                                            fontFamily: getSelectedFontFamily(fontFamily)
                                          }}
                                        >
                                          {post.verseReference || `(${post.surahName} : ${post.verseNumber})`}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {showSupportingCitationOnCard && activeCitation && (() => {
                                    const poetryParts =
                                      activeCitation.type === 'poetry' && activeCitation.text.includes('/')
                                        ? activeCitation.text.split('/').map((s) => s.trim()).filter(Boolean)
                                        : null;
                                    return (
                                      <div
                                        className={cn("border-t space-y-1", compactText ? "pt-2" : "pt-3")}
                                        style={{
                                          borderColor: isLightManuscript ? 'rgba(115, 92, 46, 0.22)' : 'rgba(255, 255, 255, 0.14)'
                                        }}
                                      >
                                        <p
                                          className="text-[10px] sm:text-xs font-bold opacity-85"
                                          style={{
                                            color: isLightManuscript ? (activeManuscript?.accentColor || '#8B6821') : '#D4AF37',
                                            fontFamily: getSelectedFontFamily(fontFamily)
                                          }}
                                        >
                                          {activeCitation.label}{activeCitation.prefix ? ` · ${activeCitation.prefix}` : ''}
                                        </p>
                                        {poetryParts && poetryParts.length >= 2 ? (
                                          <div
                                            className={cn("font-semibold leading-relaxed space-y-0.5", compactText ? "text-xs sm:text-sm" : "text-sm sm:text-base")}
                                            style={{
                                              color: isLightManuscript ? (activeManuscript?.textColor || '#221D15') : 'rgba(255,255,255,0.95)',
                                              fontFamily: getSelectedFontFamily(fontFamily)
                                            }}
                                          >
                                            <p>{poetryParts[0]}</p>
                                            <p>{poetryParts.slice(1).join(' — ')}</p>
                                          </div>
                                        ) : (
                                          <p
                                            className={cn("font-medium leading-relaxed", compactText ? "text-xs sm:text-sm" : "text-sm sm:text-base")}
                                            style={{
                                              color: isLightManuscript ? (activeManuscript?.textColor || '#221D15') : 'rgba(255,255,255,0.94)',
                                              fontFamily: getSelectedFontFamily(fontFamily)
                                            }}
                                          >
                                            {activeCitation.text}
                                          </p>
                                        )}
                                        {activeCitation.source && (
                                          <p
                                            className="text-[10px] opacity-70 font-semibold"
                                            style={{
                                              color: isLightManuscript ? (activeManuscript?.accentColor || '#8B6821') : 'rgba(255,255,255,0.78)',
                                              fontFamily: getSelectedFontFamily(fontFamily)
                                            }}
                                          >
                                            {activeCitation.source}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  {pageSignature.trim() && (
                                    <div
                                      className="pt-1.5 border-t"
                                      style={{
                                        borderColor: isLightManuscript ? 'rgba(115, 92, 46, 0.18)' : 'rgba(255, 255, 255, 0.10)'
                                      }}
                                    >
                                      <p
                                        className="text-[11px] font-bold tracking-wide"
                                        style={{
                                          color: isManuscript ? (activeManuscript?.accentColor || '#D4AF37') : '#D4AF37',
                                          fontFamily: getSelectedFontFamily(fontFamily)
                                        }}
                                      >
                                        {pageSignature.trim()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}
                    </div>

                    {/* Text Section (For Standard / Card / Split Layouts) */}
                    {layoutTemplate !== 'overlay' && (
                      <div 
                        className={cn(
                          "space-y-5 text-center",
                          layoutTemplate === 'card' ? 'p-6 m-6 mt-0 bg-white rounded-[24px] shadow-md border border-brand-olive/5' : 'p-6 sm:p-8 bg-white flex-1 flex flex-col justify-center'
                        )}
                        style={{ 
                          backgroundColor: layoutTemplate === 'split' ? '#FAF7F2' : '#ffffff', 
                          borderColor: cardFrameStyle === 'gold-border' ? 'rgba(212, 175, 55, 0.4)' : undefined,
                          fontFamily: getSelectedFontFamily(fontFamily)
                        }}
                      >
                        {showTopic && (
                          <h3 id="post-topic" className="text-xl sm:text-3xl font-bold leading-tight animate-target" style={{ color: cardAccentColor, fontFamily: getSelectedFontFamily(fontFamily) }}>
                            {post?.topic}
                          </h3>
                        )}
                        {showReflection && post?.content?.trim() && (
                          <p 
                            id="post-content" 
                            className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap animate-target font-medium" 
                            style={{ color: '#333333', fontFamily: getSelectedFontFamily(fontFamily) }}
                          >
                            {post?.content}
                          </p>
                        )}
                        {post?.verseText && (showVersePrefixInText || showVerseReferenceInText || showVerseTextInText) && (
                          <div id="post-verse-section" className="pt-4 border-t border-gray-100 space-y-2 animate-target">
                            {showVersePrefixInText && (
                              <p className="text-lg sm:text-xl leading-relaxed font-bold" style={{ color: '#1a1a1a', fontFamily: getSelectedFontFamily(fontFamily) }}>
                                {post.versePrefix || 'قال تعالى:'}
                              </p>
                            )}
                            {showVerseTextInText && (
                              <p 
                                className="text-lg sm:text-xl leading-relaxed font-bold cursor-pointer hover:text-brand-olive transition-colors" 
                                style={{ color: '#1a1a1a', fontFamily: getSelectedFontFamily(fontFamily) }}
                                onClick={() => playAudio(post.verseText || '')}
                              >
                                {post.verseText}
                                {isAudioLoading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
                              </p>
                            )}
                            {showVerseReferenceInText && (
                              <p className="text-xs sm:text-sm italic opacity-60 font-bold" style={{ color: '#666666', fontFamily: getSelectedFontFamily(fontFamily) }}>
                                {post.verseReference || `(${post.surahName} : ${post.verseNumber})`}
                              </p>
                            )}
                          </div>
                        )}
                        {showSupportingCitationOnCard && activeCitation && (() => {
                          const poetryParts =
                            activeCitation.type === 'poetry' && activeCitation.text.includes('/')
                              ? activeCitation.text.split('/').map((s) => s.trim()).filter(Boolean)
                              : null;
                          return (
                            <div
                              id="post-supporting-citation"
                              className="pt-4 border-t space-y-1.5 animate-target"
                              style={{ borderColor: 'rgba(90, 90, 64, 0.12)' }}
                            >
                              <p
                                className="text-xs sm:text-sm font-bold"
                                style={{ color: cardAccentColor, fontFamily: getSelectedFontFamily(fontFamily) }}
                              >
                                {activeCitation.label}{activeCitation.prefix ? ` · ${activeCitation.prefix}` : ''}
                              </p>
                              {poetryParts && poetryParts.length >= 2 ? (
                                <div
                                  className="text-base sm:text-lg font-semibold leading-relaxed space-y-1"
                                  style={{ color: '#262626', fontFamily: getSelectedFontFamily(fontFamily) }}
                                >
                                  <p>{poetryParts[0]}</p>
                                  <p>{poetryParts.slice(1).join(' — ')}</p>
                                </div>
                              ) : (
                                <p
                                  className="text-sm sm:text-base leading-relaxed font-medium"
                                  style={{ color: '#2b2b2b', fontFamily: getSelectedFontFamily(fontFamily) }}
                                >
                                  {activeCitation.text}
                                </p>
                              )}
                              {activeCitation.source && (
                                <p
                                  className="text-xs opacity-65 font-semibold"
                                  style={{ color: '#666666', fontFamily: getSelectedFontFamily(fontFamily) }}
                                >
                                  {activeCitation.source}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                        {pageSignature.trim() && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs font-bold tracking-wide" style={{ color: cardAccentColor, fontFamily: getSelectedFontFamily(fontFamily) }}>
                              {pageSignature.trim()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => openVerticalImageStudio('whatsapp-9x16')}
                        disabled={!post}
                        className="w-full py-3.5 sm:py-4 px-4 min-h-[50px] rounded-2xl bg-brand-gold text-zinc-950 font-bold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md shadow-brand-gold/20 hover:bg-brand-gold/90 cursor-pointer disabled:opacity-50"
                      >
                        <ImageIcon className="w-5 h-5 shrink-0" />
                        <span>تصدير صورة عمودية (واتساب · فيسبوك)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          stopPreviewAudio();
                          if (!imageUrl) {
                            setImageUrl(getLocalFallbackImage(post?.topic || 'قرآن'));
                          }
                          setIsVideoStudioOpen(true);
                        }}
                        disabled={!post}
                        className="w-full py-3.5 sm:py-4 px-4 min-h-[50px] rounded-2xl bg-brand-olive text-white font-bold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-brand-olive/20 hover:bg-brand-olive/95 cursor-pointer disabled:opacity-50"
                      >
                        <Film className="w-5 h-5 text-brand-gold shrink-0" />
                        <span>تصدير فيديو بالصوت (MP4 HD)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button 
                        type="button"
                        onClick={() => {
                          setStep('input');
                        }}
                        className={cn(
                          "w-full py-3 min-h-[46px] border-2 rounded-2xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer",
                          darkMode 
                            ? "bg-zinc-900 border-brand-olive text-zinc-200 hover:bg-brand-olive hover:text-white" 
                            : "bg-white border-brand-olive text-brand-olive hover:bg-brand-olive hover:text-white"
                        )}
                      >
                        <RefreshCw className="w-4 h-4 shrink-0" />
                        <span>منشور جديد</span>
                      </button>
                      <button 
                        type="button"
                        onClick={handleCopyFacebookCaption}
                        className={cn(
                          "w-full py-3 min-h-[46px] border-2 rounded-2xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer",
                          darkMode 
                            ? "bg-zinc-900 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-zinc-950" 
                            : "bg-brand-cream border-brand-olive/25 text-brand-ink hover:bg-brand-olive hover:text-white"
                        )}
                      >
                        <Copy className="w-4 h-4 shrink-0" />
                        <span>نسخ المنشور</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            ) : step === 'search' ? (
              <motion.div
                key="search-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="text-center space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-olive opacity-80">البحث في آيات الذكر الحكيم</span>
                  <h2 className="text-3xl font-bold serif">ابحث وتأمل واصنع</h2>
                  <p className="text-sm opacity-75 max-w-lg mx-auto leading-relaxed">
                    ابحث في القرآن الكريم واستمع للتلاوات بصوت نخبة من كبار القراء، وحوّل أي آية فوراً إلى بطاقة أو فيديو صوتي عالي الجودة.
                  </p>
                </div>

                {/* Reciter Selector inside Quran Search */}
                <div className={cn(
                  "px-4 py-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3",
                  darkMode ? "bg-zinc-900/70 border-zinc-800" : "bg-white border-brand-olive/10"
                )}>
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-olive dark:text-brand-gold">
                    <Volume2 className="w-4 h-4" />
                    <span>اختر صوت القارئ للتلاوة:</span>
                  </div>
                  <select
                    value={selectedReciter}
                    onChange={(e) => {
                      if (activeSearchAudio) {
                        activeSearchAudio.pause();
                        setPlayingAudioId(null);
                      }
                      setSelectedReciter(e.target.value);
                    }}
                    className={cn(
                      "px-3.5 py-2 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer",
                      darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-brand-cream/30 border-brand-olive/15 text-brand-ink"
                    )}
                  >
                    {QURAN_RECITERS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form or Search Bar */}
                <div className={cn(
                  "p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 shadow-md",
                  darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-brand-olive/10"
                )}>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchQuran();
                      }}
                      placeholder="اكتب كلمة للبحث (مثال: صبر، رحمة، قلوب)..."
                      className={cn(
                        "w-full pr-10 pl-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-sm sm:text-base",
                        darkMode 
                          ? "bg-zinc-950 border-zinc-800 text-white focus:ring-brand-olive/40" 
                          : "bg-brand-cream/20 border-brand-olive/15 text-brand-ink focus:ring-brand-olive/30"
                      )}
                    />
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                  </div>
                  <button
                    onClick={handleSearchQuran}
                    disabled={searching || !searchQuery.trim()}
                    className="py-3 px-8 bg-brand-olive text-white rounded-xl font-bold text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-olive/25"
                  >
                    {searching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري البحث...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>بحث</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Helpful keyword suggestions */}
                <div className="flex flex-wrap gap-2 items-center justify-center text-xs opacity-80">
                  <span className="font-semibold">كلمات مقترحة:</span>
                  {["صبر", "الرحمن", "جنة", "تقوى", "نور", "قلب"].map((kw) => (
                    <button
                      key={kw}
                      onClick={() => {
                        setSearchQuery(kw);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-[11px] transition-all",
                        darkMode 
                          ? "bg-zinc-900 border-zinc-800 hover:border-brand-olive/50 text-zinc-300"
                          : "bg-white border-brand-olive/10 hover:border-brand-olive hover:text-brand-olive text-brand-ink/70"
                      )}
                    >
                      {kw}
                    </button>
                  ))}
                </div>

                {/* Error message inside search */}
                {error && error.includes('البحث') && (
                  <div className="p-4 rounded-xl text-xs bg-red-50 text-red-700 border border-red-200 text-center">
                    {error}
                  </div>
                )}

                {/* Results list */}
                {searching ? (
                  <div className="py-20 text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-olive mx-auto" />
                    <p className="text-sm font-medium opacity-60">جاري تصفح المصحف الشريف العظيم...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 text-xs font-bold opacity-60">
                      <span>تم العثور على {searchResults.length} آية كريمة</span>
                      <span>اضغط على الأيقونات للاستماع أو النسخ</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.map((match: any) => {
                        const uniqueId = `search-ayah-${match.surah.number}-${match.numberInSurah}`;
                        const isThisPlaying = playingAudioId === uniqueId;
                        const fullTextToShare = `📖 قال تعالى:\n{ ${match.text} }\n[${match.surah.name} : ${match.numberInSurah}]`;

                        return (
                          <motion.div
                            key={uniqueId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "p-6 rounded-2xl border transition-all relative group flex flex-col gap-5",
                              darkMode 
                                ? "bg-zinc-900 border-zinc-800 hover:border-brand-olive/30" 
                                : "bg-white border-brand-olive/10 hover:border-brand-olive/20 hover:shadow-md"
                            )}
                          >
                            <div className="flex justify-between items-start gap-4 border-b border-brand-olive/5 pb-3">
                              <span className="text-xs font-mono font-bold bg-brand-olive/10 text-brand-olive px-2.5 py-1 rounded-full">
                                {match.surah.name} : الآية {match.numberInSurah}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {/* Listen Button */}
                                <button
                                  onClick={() => toggleSearchAudio(match.surah.number, match.numberInSurah, uniqueId)}
                                  className={cn(
                                    "p-2 rounded-xl border transition-all flex items-center justify-center gap-1.5",
                                    isThisPlaying 
                                      ? "bg-red-500 text-white border-red-500" 
                                      : (darkMode ? "bg-zinc-950 border-zinc-800 text-brand-olive hover:bg-zinc-800" : "bg-brand-cream border-brand-olive/15 hover:bg-brand-olive hover:text-white text-brand-olive")
                                  )}
                                  title={isThisPlaying ? "إيقاف التلاوة" : "الاستماع للتلاوة"}
                                >
                                  {isThisPlaying ? (
                                    <>
                                      <Square className="w-3.5 h-3.5 fill-current animate-pulse" />
                                      <span className="text-[10px] font-bold">إيقاف</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-bold">استماع</span>
                                    </>
                                  )}
                                </button>

                                {/* Copy Button */}
                                <button
                                  onClick={() => handleCopyText(fullTextToShare, uniqueId)}
                                  className={cn(
                                    "p-2 rounded-xl border transition-all flex items-center justify-center gap-1.5",
                                    copyFeedback === uniqueId 
                                      ? "bg-green-500 text-white border-green-500" 
                                      : (darkMode ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800" : "bg-white border-brand-olive/10 hover:bg-brand-olive hover:text-white text-brand-ink/60")
                                  )}
                                  title="نسخ الآية الكريمة"
                                >
                                  {copyFeedback === uniqueId ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-bold">تم نسخها</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-bold">نسخ</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Verse text */}
                            <p className="text-xl sm:text-2xl font-serif leading-loose text-center py-2" style={{ textRendering: 'optimizeLegibility' }}>
                              {match.text}
                            </p>

                            {/* Select Option to make a post for it! */}
                            <div className="flex items-center justify-end border-t border-brand-olive/5 pt-3">
                              <button
                                onClick={() => selectVerseFromSearch(match)}
                                className="px-5 py-2.5 bg-brand-olive text-white rounded-xl font-bold text-xs hover:bg-brand-olive/95 transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>تصميم منشور إيماني لهذه الآية</span>
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="py-20 text-center space-y-3 p-8 border-2 border-dashed border-brand-olive/20 rounded-2xl">
                    <BookOpen className="w-12 h-12 text-brand-olive/40 mx-auto" />
                    <p className="text-base font-semibold">لا توجد نتائج مطابقة لبحثك</p>
                    <p className="text-xs opacity-60">جرب البحث بكلمات أبسط أو مشتقات دقيقة كالمذكور أعلاه.</p>
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-4 p-8 border-2 border-dashed border-brand-olive/20 rounded-2xl bg-brand-olive/5 dark:bg-zinc-900/30">
                    <Search className="w-12 h-12 text-brand-olive/40 mx-auto" />
                    <p className="text-base font-semibold">ابدأ البحث الآن</p>
                    <p className="text-xs opacity-70">اكتب أي كلمة، عبارة، أو اسم سورة للبحث عن الآيات المتعلقة بها.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              // History Step
              <motion.div
                key="history-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="max-w-5xl mx-auto space-y-8"
              >
                <div className="text-center space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-olive opacity-80">أرشيف إنتاجاتك الإيمانية</span>
                  <h2 className="text-3xl font-bold serif">سجل أعمالك الصالحة</h2>
                  <p className="text-sm opacity-75 max-w-lg mx-auto leading-relaxed">
                    من هنا يمكنك تصفح ومطالعة ومشاركة المنشورات والبطاقات التي قمت بتوليدها وتصميمها سابقاً.
                  </p>
                </div>

                {postHistory.length === 0 ? (
                  <div className="py-16 text-center space-y-4 p-8 border-2 border-dashed border-brand-olive/20 rounded-3xl bg-brand-olive/5 dark:bg-zinc-900/30">
                    <HistoryIcon className="w-12 h-12 text-brand-olive/30 mx-auto" />
                    <p className="text-base font-semibold">السجل فارغ حتى الآن</p>
                    <p className="text-xs opacity-70">عندما تقوم بتوليد أي منشور، سيتم حفظه هنا تلقائياً لسهولة الرجوع إليه.</p>
                    <button
                      onClick={() => setStep('input')}
                      className="px-6 py-2.5 bg-brand-olive text-white rounded-xl font-bold text-xs shadow-md shadow-brand-olive/20 hover:scale-[1.03] transition-all mt-4"
                    >
                      اصنع منشورك الأول الآن
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-bold opacity-60">تاريخ آخر {postHistory.length} منشورات تم توليدها</span>
                      {showClearAllConfirm ? (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-1 px-3 rounded-xl border border-red-100 dark:border-red-900/30">
                          <span className="text-xs text-red-600 dark:text-red-400 font-bold">بالمسح الكامل؟</span>
                          <button
                            onClick={() => {
                              setPostHistory([]);
                              localStorage.removeItem('noor_history');
                              setShowClearAllConfirm(false);
                            }}
                            className="text-[11px] font-bold bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 transition-all"
                          >
                            تأكيد المسح
                          </button>
                          <button
                            onClick={() => setShowClearAllConfirm(false)}
                            className="text-[11px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg hover:bg-zinc-300 transition-all"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowClearAllConfirm(true)}
                          className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5 p-1 px-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>مسح السجل كاملاً</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {postHistory.map((item: any) => {
                        const uniqueId = `history-item-${item.id}`;
                        const formattedDate = new Date(item.timestamp).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        const postTextToShare = `✨ *${item.post.topic}* ✨\n\n${item.post.content}\n\n${item.post.verseText ? `📖 قال تعالى:\n{ ${item.post.verseText} }\n${item.post.verseReference || ''}` : ''}`;

                        return (
                          <motion.div
                            key={item.id}
                            className={cn(
                              "border rounded-[30px] overflow-hidden flex flex-col transition-all h-full shadow-sm hover:shadow-lg relative",
                              darkMode 
                                ? "bg-zinc-900 border-zinc-800 hover:border-brand-olive/20" 
                                : "bg-white border-brand-olive/10 hover:border-brand-olive/15"
                            )}
                          >
                            <span className="absolute top-4 left-4 text-[9px] font-mono opacity-40 z-10 select-none">
                              {formattedDate}
                            </span>

                            <div className="p-5 flex gap-4 items-start flex-1">
                              {/* Post Mini Thumbnail if imageUrl exists */}
                              {item.imageUrl && (
                                <div className="w-20 sm:w-24 aspect-[4/5] rounded-[20px] overflow-hidden border border-brand-olive/15 shrink-0 relative bg-brand-olive/5">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.post.topic}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      e.currentTarget.src = getLocalFallbackImage(item.post.topic);
                                    }}
                                  />
                                </div>
                              )}

                              {/* Text Details */}
                              <div className="space-y-2 flex-1 min-w-0">
                                <h3 className="text-base font-bold serif truncate text-brand-olive dark:text-brand-gold pr-16 sm:pr-0">
                                  {item.post.topic}
                                </h3>
                                <p className="text-xs opacity-75 line-clamp-3 leading-relaxed">
                                  {item.post.content}
                                </p>
                                {item.post.verseText && (
                                  <p className="text-[11px] font-serif opacity-90 border-r-2 border-brand-olive/30 pr-2 truncate italic">
                                    {item.post.verseText}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Actions bar for history card */}
                            <div className={cn(
                              "px-5 py-3 border-t flex items-center justify-between gap-2",
                              darkMode ? "border-zinc-800 bg-zinc-950/20" : "border-brand-olive/5 bg-brand-cream/10"
                            )}>
                              <div className="flex items-center gap-1.5">
                                {/* Load into editor */}
                                <button
                                  onClick={() => {
                                    setPost(item.post);
                                    setActiveManuscriptId(item.manuscriptId || null);
                                    setImageUrl(item.imageUrl);
                                    if (item.aspectRatio) setAspectRatio(item.aspectRatio);
                                    if (item.layoutTemplate) setLayoutTemplate(item.layoutTemplate);
                                    setStep('preview');
                                  }}
                                  className="px-3 py-1.5 bg-brand-olive/10 text-brand-olive dark:text-brand-gold hover:bg-brand-olive hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                                  title="عرض المخرجات في الشاشة التفاعلية"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>عرض وتصميم</span>
                                </button>
                                
                                {/* Quick copy text */}
                                <button
                                  onClick={() => handleCopyText(postTextToShare, uniqueId)}
                                  className={cn(
                                    "p-1.5 rounded-lg border transition-all flex items-center justify-center",
                                    copyFeedback === uniqueId 
                                      ? "bg-green-500 text-white border-green-500" 
                                      : (darkMode ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800" : "bg-white border-brand-olive/10 hover:bg-brand-olive hover:text-white text-brand-ink/60")
                                  )}
                                  title="نسخ نص المنشور"
                                >
                                  {copyFeedback === uniqueId ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              {/* Delete single button */}
                              {deletingItemId === item.id ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      const updated = postHistory.filter((it: any) => it.id !== item.id);
                                      saveHistoryWithPruning(updated);
                                      setDeletingItemId(null);
                                    }}
                                    className="px-2.5 py-1 text-[10px] bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
                                    title="تأكيد حذف المنشور"
                                  >
                                    تأكيد
                                  </button>
                                  <button
                                    onClick={() => setDeletingItemId(null)}
                                    className="px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingItemId(item.id)}
                                  className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/10 transition-all"
                                  title="حذف هذا المنشور من السجل"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer (Hidden behind mobile tab bar padding cleanly) */}
        <footer className={cn(
          "max-w-7xl mx-auto px-6 py-8 sm:py-12 pb-24 md:pb-12 text-center border-t mt-12 sm:mt-20",
          darkMode ? "border-zinc-800" : "border-brand-olive/10"
        )}>
          <p className={cn(
            "text-xs sm:text-sm font-medium",
            darkMode ? "text-zinc-500" : "text-brand-ink/45"
          )}>
            تم التطوير بكل حب لنشر الخير • {new Date().getFullYear()}
          </p>
        </footer>

        {/* Mobile Ergonomic Bottom Tab Bar (Thumb-Zone Navigation) */}
        <nav
          aria-label="التنقل السريع على الجوال"
          className={cn(
            "md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-md pb-safe",
            darkMode
              ? "bg-zinc-950/92 border-zinc-800/90"
              : "bg-white/92 border-brand-olive/15 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
          )}
        >
          <div className="grid grid-cols-4 items-center h-16 px-1">
            {(
              [
                {
                  id: 'input',
                  label: 'الرئيسية',
                  icon: Sparkles,
                  active: step === 'input' || step === 'preview',
                },
                {
                  id: 'gallery',
                  label: 'المعرض',
                  icon: ImageIcon,
                  active: step === 'gallery',
                },
                {
                  id: 'search',
                  label: 'القرآن',
                  icon: BookOpen,
                  active: step === 'search',
                },
                {
                  id: 'history',
                  label: postHistory.length > 0 ? `السجل (${postHistory.length})` : 'السجل',
                  icon: HistoryIcon,
                  active: step === 'history',
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 min-h-[48px] rounded-xl transition-colors cursor-pointer",
                    item.active
                      ? "text-brand-olive dark:text-brand-gold font-bold"
                      : darkMode
                        ? "text-zinc-400 hover:text-zinc-200"
                        : "text-brand-ink/60 hover:text-brand-ink"
                  )}
                >
                  <Icon className={cn("w-5 h-5", item.active && "scale-105")} />
                  <span className="text-[10px] leading-none whitespace-nowrap truncate max-w-[72px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* HD Audio-Video Export Studio Modal */}
        {post && (
          <VideoStudioModal
            isOpen={isVideoStudioOpen}
            onClose={() => setIsVideoStudioOpen(false)}
            darkMode={darkMode}
            post={post}
            imageUrl={imageUrl || getLocalFallbackImage(post.topic || 'قرآن')}
            aspectRatio={aspectRatio}
            onChangeAspectRatio={(r) => setAspectRatio(r)}
            layoutTemplate={layoutTemplate}
            cardFrameStyle={cardFrameStyle}
            cardAccentColor={cardAccentColor}
            fontFamily={fontFamily}
            fontFamilyCss={getSelectedFontFamily(fontFamily)}
            fontSize={fontSize}
            overlayOpacity={getDynamicOverlayOpacity()}
            showTopic={showTopic}
            showReflection={showReflection}
            showVersePrefix={showVersePrefixInText}
            showVerseText={showVerseTextInText}
            showVerseReference={showVerseReferenceInText}
            showVerseOnImage={showVerseOnImage}
            pageSignature={pageSignature}
            selectedReciter={selectedReciter}
            onSelectReciter={(id) => setSelectedReciter(id)}
            activeCitationIndex={safeCitationIndex}
            onSelectCitationIndex={(idx) => setActiveCitationIndex(idx)}
            showSupportingCitation={showSupportingCitationOnCard}
            onToggleSupportingCitation={(show) => setShowSupportingCitationOnCard(show)}
            onNotify={(msg) => showToast(msg)}
          />
        )}

        {/* Professional Vertical Image Export Studio Modal (WhatsApp 9:16 & Facebook 4:5) */}
        {post && (
          <ImageExportModal
            isOpen={isImageExportOpen}
            onClose={() => setIsImageExportOpen(false)}
            darkMode={darkMode}
            post={post}
            imageUrl={imageUrl || getLocalFallbackImage(post.topic || 'قرآن')}
            fontFamily={fontFamily}
            fontFamilyCss={getSelectedFontFamily(fontFamily)}
            cardAccentColor={cardAccentColor}
            cardFrameStyle={cardFrameStyle}
            overlayOpacity={getDynamicOverlayOpacity()}
            showTopic={showTopic}
            showReflection={showReflection}
            showVersePrefix={showVersePrefixInText}
            showVerseText={showVerseTextInText}
            showVerseReference={showVerseReferenceInText}
            showSupportingCitation={showSupportingCitationOnCard}
            activeCitationIndex={safeCitationIndex}
            onSelectCitationIndex={(idx) => setActiveCitationIndex(idx)}
            onToggleSupportingCitation={(show) => setShowSupportingCitationOnCard(show)}
            pageSignature={pageSignature}
            initialFormat={imageExportInitialFormat}
            onNotify={(msg) => showToast(msg)}
          />
        )}
        {/* Settings Modal: Dark Mode, Mobile PWA Install & Smart Multi-Key AI Rotation */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onNotify={(msg) => showToast(msg)}
        />

        {/* Offline Connectivity Banner */}
        <OfflineIndicator />
      </div>
  );
}
