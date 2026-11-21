import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Play,
  Pause,
  Film,
  Volume2,
  Download,
  Share2,
  Loader2,
  Sparkles,
  Check,
  Music,
  RefreshCw,
  Sliders,
  Type,
  Quote,
} from 'lucide-react';
import { AspectRatio, GeneratedPost } from '../services/geminiService';
import {
  CITATION_TYPE_LABELS,
  SupportingCitation,
  buildReflectionWithCitationSpeech,
} from '../utils/categoryEditorial';
import { QURAN_RECITERS, getReciterById } from '../utils/quranData';
import {
  PreparedStudioAudio,
  ReflectionRevealMode,
  SyncedReflectionPlan,
  VideoAudioMode,
  VideoMotionStyle,
  VideoRenderConfig,
  VideoVisualLayout,
  buildSyncedReflectionPlan,
  createGoldenParticles,
  drawAnimatedVideoFrame,
  exportAnimatedWaveformMp4,
  exportFastStudioMp4,
  getVideoDimensions,
  prepareStudioAudio,
  renderLayeredVideoCanvases,
} from '../services/videoStudioService';
import { isStaticHostWithoutBackend } from '../services/apiEnvironment';

interface VideoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  post: GeneratedPost;
  imageUrl: string;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  layoutTemplate: 'standard' | 'overlay' | 'card' | 'split';
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
  selectedReciter: string;
  onSelectReciter: (reciterId: string) => void;
  activeCitationIndex?: number;
  onSelectCitationIndex?: (idx: number) => void;
  showSupportingCitation?: boolean;
  onToggleSupportingCitation?: (show: boolean) => void;
  onNotify: (msg: string) => void;
}

const ASPECT_OPTIONS: Array<{ id: AspectRatio; label: string; hint: string }> = [
  { id: '9:16', label: '9:16', hint: 'واتساب / ريلز' },
  { id: '3:4', label: '3:4', hint: 'فيسبوك عمودي' },
  { id: '1:1', label: '1:1', hint: 'مربع' },
  { id: '16:9', label: '16:9', hint: 'يوتيوب / عرضي' },
];

const formatTime = (sec: number) => {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const VideoStudioModal: React.FC<VideoStudioModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  post,
  imageUrl,
  aspectRatio,
  onChangeAspectRatio,
  layoutTemplate,
  cardFrameStyle,
  cardAccentColor,
  fontFamily,
  fontFamilyCss,
  fontSize,
  overlayOpacity,
  showTopic,
  showReflection = true,
  showVersePrefix,
  showVerseText,
  showVerseReference,
  showVerseOnImage,
  pageSignature,
  selectedReciter,
  onSelectReciter,
  activeCitationIndex = 0,
  onSelectCitationIndex,
  showSupportingCitation = true,
  onToggleSupportingCitation,
  onNotify,
}) => {
  const [audioMode, setAudioMode] = useState<VideoAudioMode>(
    post.verseText?.trim() ? 'verse' : 'reflection'
  );
  const [motionStyle, setMotionStyle] = useState<VideoMotionStyle>('kenburns');
  const [visualLayout, setVisualLayout] = useState<VideoVisualLayout>('cinema');
  const [reflectionRevealMode, setReflectionRevealMode] = useState<ReflectionRevealMode>('sentences');
  const [showReciterCredit, setShowReciterCredit] = useState(true);
  const [localCitationIndex, setLocalCitationIndex] = useState(activeCitationIndex);
  const [localShowCitation, setLocalShowCitation] = useState(showSupportingCitation);
  const [includeReflectionInAudio, setIncludeReflectionInAudio] = useState<boolean>(
    !post.verseText?.trim()
  );
  const [includeCitationInAudio, setIncludeCitationInAudio] = useState<boolean>(
    !post.verseText?.trim()
  );

  const citations = post.citations || [];
  const effectiveCitationIndex = onSelectCitationIndex ? activeCitationIndex : localCitationIndex;
  const effectiveShowCitation = onToggleSupportingCitation ? showSupportingCitation : localShowCitation;
  const safeCitationIndex =
    citations.length > 0 ? Math.min(effectiveCitationIndex, citations.length - 1) : 0;
  const activeCitation: SupportingCitation | null = citations[safeCitationIndex] || null;

  const handleSelectCitation = (idx: number) => {
    stopPreviewPlayback();
    setExportedVideoUrl(null);
    setExportedVideoBlob(null);
    if (onSelectCitationIndex) {
      onSelectCitationIndex(idx);
    } else {
      setLocalCitationIndex(idx);
    }
  };

  const handleToggleCitation = (show: boolean) => {
    stopPreviewPlayback();
    setExportedVideoUrl(null);
    setExportedVideoBlob(null);
    if (onToggleSupportingCitation) {
      onToggleSupportingCitation(show);
    } else {
      setLocalShowCitation(show);
    }
  };

  const [audioData, setAudioData] = useState<PreparedStudioAudio | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioStatus, setAudioStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const layersRef = useRef<{
    width: number;
    height: number;
    bgCanvas: HTMLCanvasElement;
    overlayCanvas: HTMLCanvasElement;
    imageEl: HTMLImageElement;
  } | null>(null);
  const particlesRef = useRef(createGoldenParticles(28));

  // Playback audio nodes for live waveform visualization
  const playCtxRef = useRef<AudioContext | null>(null);
  const playSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playAnalyserRef = useRef<AnalyserNode | null>(null);
  const playStartAtRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const stopPreviewPlayback = () => {
    cancelAnimationFrame(rafRef.current);
    if (playSourceRef.current) {
      try {
        playSourceRef.current.stop();
      } catch {}
      playSourceRef.current = null;
    }
    if (playCtxRef.current) {
      playCtxRef.current.close().catch(() => {});
      playCtxRef.current = null;
    }
    playAnalyserRef.current = null;
    setIsPlayingPreview(false);
  };

  const activeRevealMode: ReflectionRevealMode =
    visualLayout === 'verse-synced' ? reflectionRevealMode : 'none';

  const reflectionPlan = useMemo<SyncedReflectionPlan | null>(() => {
    if (activeRevealMode === 'none') return null;
    const fallbackSpoken = buildReflectionWithCitationSpeech(
      post.content?.trim() || '',
      activeCitation,
      includeCitationInAudio && effectiveShowCitation
    );
    const sourceText =
      (audioData?.timeline.hasReflectionAudio && audioData.reflectionSpokenText) ||
      fallbackSpoken ||
      '';
    if (!sourceText) return null;

    if (audioData?.timeline.hasReflectionAudio) {
      return buildSyncedReflectionPlan(
        sourceText,
        audioData.timeline.reflectionStartSec,
        audioData.timeline.reflectionEndSec
      );
    }

    const dur = audioData?.durationSec || 12;
    return buildSyncedReflectionPlan(sourceText, 0.6, Math.max(2.2, dur - 0.8));
  }, [activeRevealMode, audioData, post.content, activeCitation, includeCitationInAudio, effectiveShowCitation]);

  const handleSelectVisualLayout = (layout: VideoVisualLayout) => {
    stopPreviewPlayback();
    setVisualLayout(layout);
    setExportedVideoUrl(null);
    setExportedVideoBlob(null);
    if (layout === 'simple-vertical') {
      if (aspectRatio !== '9:16') {
        onChangeAspectRatio('9:16');
      }
      setShowReciterCredit(false);
    } else if (
      layout === 'verse-synced' &&
      reflectionRevealMode !== 'none' &&
      audioMode === 'verse' &&
      post.verseText?.trim() &&
      post.content?.trim()
    ) {
      setAudioMode('full');
      setIncludeReflectionInAudio(true);
    }
  };

  const handleSelectAudioPreset = (mode: VideoAudioMode) => {
    stopPreviewPlayback();
    setExportedVideoUrl(null);
    setExportedVideoBlob(null);
    setAudioMode(mode);
    if (mode === 'verse') {
      setIncludeReflectionInAudio(false);
      setIncludeCitationInAudio(false);
    } else if (mode === 'full') {
      setIncludeReflectionInAudio(true);
      if (activeCitation) setIncludeCitationInAudio(true);
    } else {
      setIncludeReflectionInAudio(true);
    }
  };

  const handleToggleReflectionAudio = (checked: boolean) => {
    stopPreviewPlayback();
    setExportedVideoUrl(null);
    setExportedVideoBlob(null);
    setIncludeReflectionInAudio(checked);
    if (checked && audioMode === 'verse') {
      setAudioMode('full');
    } else if (!checked && audioMode === 'full' && !includeCitationInAudio) {
      setAudioMode('verse');
    } else if (!checked && audioMode === 'reflection' && !includeCitationInAudio && post.verseText?.trim()) {
      setAudioMode('verse');
    }
  };

  const handleToggleCitationAudio = (checked: boolean) => {
    stopPreviewPlayback();
    setExportedVideoUrl(null);
    setExportedVideoBlob(null);
    setIncludeCitationInAudio(checked);
    if (!checked && !includeReflectionInAudio && audioMode !== 'verse' && post.verseText?.trim()) {
      setAudioMode('verse');
    }
  };

  const handleSelectReflectionRevealMode = (mode: ReflectionRevealMode) => {
    stopPreviewPlayback();
    setReflectionRevealMode(mode);
    setExportedVideoUrl(null);
    setExportedVideoBlob(null);
    if (
      mode !== 'none' &&
      audioMode === 'verse' &&
      post.verseText?.trim() &&
      post.content?.trim()
    ) {
      setAudioMode('full');
      setIncludeReflectionInAudio(true);
    }
  };

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !exporting) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, exporting, onClose]);

  // Cleanup URLs and playback on close
  useEffect(() => {
    if (!isOpen) {
      stopPreviewPlayback();
      return;
    }
    return () => {
      stopPreviewPlayback();
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);
    };
  }, [exportedVideoUrl]);

  useEffect(() => {
    return () => {
      if (audioData?.wavObjectUrl) URL.revokeObjectURL(audioData.wavObjectUrl);
    };
  }, [audioData]);

  // Track whether citation changes affect the audio track (avoids re-fetching verse-only recitations)
  const spokenCitationForTrack =
    includeCitationInAudio && activeCitation?.text?.trim() ? activeCitation : null;
  const spokenCitationKey = spokenCitationForTrack
    ? `${spokenCitationForTrack.type}|${spokenCitationForTrack.prefix || ''}|${spokenCitationForTrack.text}|${spokenCitationForTrack.source || ''}`
    : '';

  // Load studio audio whenever modal opens or reciter/audioMode/spoken toggles change
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    stopPreviewPlayback();
    setExportedVideoUrl(null);
    setExportedVideoBlob(null);
    setCurrentTime(0);
    setError(null);
    setLoadingAudio(true);

    prepareStudioAudio({
      post,
      reciterId: selectedReciter,
      audioMode,
      activeCitation: spokenCitationForTrack,
      includeReflectionInAudio,
      includeCitationInAudio: Boolean(spokenCitationForTrack),
      onStatus: (msg) => {
        if (!cancelled) setAudioStatus(msg);
      },
    })
      .then((prepared) => {
        if (cancelled) {
          URL.revokeObjectURL(prepared.wavObjectUrl);
          return;
        }
        setAudioData(prepared);
        setAudioStatus(prepared.sourceNote);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'تعذر تجهيز الصوت حالياً.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAudio(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedReciter, audioMode, includeReflectionInAudio, post, spokenCitationKey]);

  // Build crisp 1080p layers whenever visual settings or resolved audio metadata changes
  useEffect(() => {
    if (!isOpen || !imageUrl) return;
    let cancelled = false;

    const reciter = getReciterById(selectedReciter);
    const config: VideoRenderConfig = {
      post,
      imageUrl,
      aspectRatio,
      layoutTemplate,
      visualLayout,
      reflectionRevealMode: activeRevealMode,
      cardFrameStyle,
      cardAccentColor,
      fontFamily,
      fontFamilyCss,
      fontSize,
      overlayOpacity,
      showTopic,
      showReflection,
      showVersePrefix,
      showVerseText,
      showVerseReference,
      showVerseOnImage,
      activeCitation,
      showCitationInVideo: effectiveShowCitation,
      pageSignature,
      reciterId: selectedReciter,
      reciterLabel: audioData?.reciterName || reciter.name,
      showReciterCredit,
      isAuthenticQuran: audioData?.isAuthenticQuran ?? Boolean(post.verseText),
      surahBadge: audioData?.surahBadge,
    };

    renderLayeredVideoCanvases(config)
      .then((layers) => {
        if (cancelled) return;
        layersRef.current = layers;
        const canvas = previewCanvasRef.current;
        if (canvas) {
          canvas.width = layers.width;
          canvas.height = layers.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawAnimatedVideoFrame({
              ctx,
              width: layers.width,
              height: layers.height,
              imageEl: layers.imageEl,
              overlayCanvas: layers.overlayCanvas,
              elapsedSec: Math.max(0.8, currentTime),
              durationSec: audioData?.durationSec || 10,
              motionStyle,
              particles: particlesRef.current,
              frequencyData: null,
              showWaveform: motionStyle === 'waveform',
              reflectionPlan,
              reflectionRevealMode: activeRevealMode,
              fontFamilyCss,
              previewSample: true,
            });
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Layer build failed:', err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    imageUrl,
    aspectRatio,
    layoutTemplate,
    visualLayout,
    activeRevealMode,
    reflectionPlan,
    cardFrameStyle,
    cardAccentColor,
    fontFamily,
    fontFamilyCss,
    fontSize,
    overlayOpacity,
    showTopic,
    showReflection,
    showVersePrefix,
    showVerseText,
    showVerseReference,
    showVerseOnImage,
    activeCitation,
    effectiveShowCitation,
    pageSignature,
    selectedReciter,
    showReciterCredit,
    motionStyle,
    audioData?.reciterName,
    audioData?.surahBadge,
    audioData?.isAuthenticQuran,
    audioData?.durationSec,
    post,
  ]);

  const handleTogglePreview = async () => {
    if (isPlayingPreview) {
      stopPreviewPlayback();
      return;
    }
    if (!audioData || !layersRef.current || !previewCanvasRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createBufferSource();
      source.buffer = audioData.audioBuffer;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.78;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      playCtxRef.current = ctx;
      playSourceRef.current = source;
      playAnalyserRef.current = analyser;
      playStartAtRef.current = performance.now();

      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const durationSec = audioData.durationSec;

      source.onended = () => {
        stopPreviewPlayback();
        setCurrentTime(0);
      };

      setIsPlayingPreview(true);
      source.start(0);

      const tick = () => {
        const layers = layersRef.current;
        const canvas = previewCanvasRef.current;
        if (!layers || !canvas || !playAnalyserRef.current) return;

        const elapsedSec = (performance.now() - playStartAtRef.current) / 1000;
        setCurrentTime(Math.min(durationSec, elapsedSec));
        playAnalyserRef.current.getByteFrequencyData(freqData);

        const drawCtx = canvas.getContext('2d');
        if (drawCtx) {
          drawAnimatedVideoFrame({
            ctx: drawCtx,
            width: layers.width,
            height: layers.height,
            imageEl: layers.imageEl,
            overlayCanvas: layers.overlayCanvas,
            elapsedSec: Math.min(durationSec, elapsedSec),
            durationSec,
            motionStyle,
            particles: particlesRef.current,
            frequencyData: freqData,
            showWaveform: motionStyle === 'waveform',
            reflectionPlan,
            reflectionRevealMode: activeRevealMode,
            fontFamilyCss,
            previewSample: false,
          });
        }

        if (elapsedSec < durationSec) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.error('Preview play error:', err);
      stopPreviewPlayback();
    }
  };

  const handleExportVideo = async () => {
    if (!audioData || !layersRef.current || exporting) return;
    stopPreviewPlayback();
    setExporting(true);
    setError(null);
    setExportProgress(8);
    setExportStatus('جاري تجهيز اللوحة بدقة 1080p...');

    try {
      let blob: Blob;
      const layers = layersRef.current;
      const needsAnimatedExport =
        isStaticHostWithoutBackend() ||
        motionStyle === 'waveform' ||
        (activeRevealMode !== 'none' && Boolean(reflectionPlan));

      if (needsAnimatedExport) {
        blob = await exportAnimatedWaveformMp4({
          width: layers.width,
          height: layers.height,
          imageEl: layers.imageEl,
          overlayCanvas: layers.overlayCanvas,
          audio: audioData,
          motionStyle,
          reflectionPlan,
          reflectionRevealMode: activeRevealMode,
          fontFamilyCss,
          onStatus: (msg, pct) => {
            setExportStatus(msg);
            setExportProgress(pct);
          },
        });
      } else {
        blob = await exportFastStudioMp4({
          bgCanvas: layers.bgCanvas,
          overlayCanvas: layers.overlayCanvas,
          audio: audioData,
          motionStyle: motionStyle === 'static' ? 'static' : 'kenburns',
          onStatus: (msg, pct) => {
            setExportStatus(msg);
            setExportProgress(pct);
          },
        });
      }

      if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);
      const url = URL.createObjectURL(blob);
      setExportedVideoBlob(blob);
      setExportedVideoUrl(url);
      onNotify('تم إنشاء الفيديو عالي الجودة بالصوت بنجاح وجاهز للتحميل والمشاركة');
    } catch (err) {
      console.error('Video export failed:', err);
      setError(err instanceof Error ? err.message : 'تعذر تصدير الفيديو حالياً.');
    } finally {
      setExporting(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const handleDownloadMp4 = () => {
    if (!exportedVideoBlob) return;
    const ext = exportedVideoBlob.type.includes('webm') ? 'webm' : 'mp4';
    triggerDownload(exportedVideoBlob, `noor-islamic-video-${Date.now()}.${ext}`);
    onNotify('بدأ تحميل الفيديو على جهازك');
  };

  const handleShareVideo = async () => {
    if (!exportedVideoBlob) return;
    const ext = exportedVideoBlob.type.includes('webm') ? 'webm' : 'mp4';
    const mime = exportedVideoBlob.type || 'video/mp4';
    const file = new File([exportedVideoBlob], `noor-video.${ext}`, { type: mime });
    const shareText = `✨ ${post.topic}\n${post.verseText ? `﴿ ${post.verseText} ﴾` : ''}`;

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: post.topic,
          text: shareText,
        });
        return;
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') return;
    }

    // Fallback: download file + notify user to attach on WhatsApp
    handleDownloadMp4();
    onNotify('تم حفظ الفيديو بصيغة MP4 — يمكنك إرفاقه مباشرة في حالة واتساب أو ريلز');
  };

  const handleDownloadAudioOnly = () => {
    if (!audioData) return;
    triggerDownload(audioData.wavBlob, `noor-recitation-${Date.now()}.wav`);
    onNotify('تم حفظ الملف الصوتي عالي الجودة على جهازك');
  };

  if (!isOpen) return null;

  const dims = getVideoDimensions(aspectRatio);
  const durationSec = audioData?.durationSec || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-5 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="استوديو تصدير الفيديو بالصوت"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`w-full max-w-5xl rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[94vh] flex flex-col ${
          darkMode
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-[#FBF9F5] border-brand-olive/20 text-brand-ink'
        }`}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-brand-olive/25 dark:bg-zinc-700" />
        </div>

        {/* Top Modal Header */}
        <div
          className={`px-4 sm:px-7 py-3 sm:py-4 border-b flex items-center justify-between gap-3 shrink-0 ${
            darkMode ? 'border-zinc-800 bg-zinc-900/70' : 'border-brand-olive/10 bg-white'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-olive text-white flex items-center justify-center shrink-0">
              <Film className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold serif leading-tight truncate">
                استوديو تصدير الفيديو الصوتي
              </h2>
              <p className="text-[11px] sm:text-xs opacity-65 mt-0.5 tabular-nums truncate">
                إخراج فائق الدقة ({dims.width}×{dims.height} HD · MP4) مع تلاوة كبار القراء
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={exporting}
            aria-label="إغلاق استوديو الفيديو"
            className={`w-11 h-11 rounded-xl border transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0 ${
              darkMode
                ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'border-brand-olive/15 text-brand-ink/70 hover:text-brand-ink hover:bg-brand-cream/40'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 pb-safe">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Preview Column (5 cols on desktop) */}
            <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
              <div
                className={`rounded-2xl border p-3 sm:p-3.5 space-y-3 ${
                  darkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-brand-olive/15'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-olive dark:text-brand-gold">
                    {exportedVideoUrl ? 'الفيديو النهائي الجاهز (MP4)' : 'المعاينة الحية قبل التصدير'}
                  </span>
                  <span className="opacity-65 tabular-nums">
                    {dims.width}×{dims.height}
                  </span>
                </div>

                {/* Live Canvas or Final Exported Video */}
                <div className="relative rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center max-h-[340px] sm:max-h-[460px]">
                  {exportedVideoUrl ? (
                    <video
                      key={exportedVideoUrl}
                      src={exportedVideoUrl}
                      controls
                      playsInline
                      className="w-full max-h-[330px] sm:max-h-[450px] object-contain"
                    />
                  ) : (
                    <>
                      <canvas
                        ref={previewCanvasRef}
                        className="w-full h-auto max-h-[330px] sm:max-h-[450px] object-contain block"
                      />
                      {loadingAudio && (
                        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2.5 text-white p-4 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
                          <p className="text-xs font-bold">{audioStatus || 'جاري تجهيز التلاوة...'}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Playback Controls Bar for Live Canvas Preview */}
                {!exportedVideoUrl && (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleTogglePreview}
                      disabled={loadingAudio || !audioData || exporting}
                      className="px-4 py-2.5 min-h-[42px] rounded-xl bg-brand-olive text-white font-bold text-xs flex items-center gap-2 hover:bg-brand-olive/90 transition-all disabled:opacity-45 cursor-pointer"
                    >
                      {isPlayingPreview ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>إيقاف المعاينة</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>معاينة الصوت والحركة</span>
                        </>
                      )}
                    </button>

                    <div className="text-left">
                      <p className="text-xs font-bold tabular-nums">
                        {formatTime(currentTime)} / {formatTime(durationSec)}
                      </p>
                      <p className="text-[11px] opacity-60 truncate max-w-[175px]">
                        {audioData?.surahBadge || audioData?.reciterName || 'جاري التحميل...'}
                      </p>
                    </div>
                  </div>
                )}

                {exportedVideoUrl && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);
                        setExportedVideoUrl(null);
                        setExportedVideoBlob(null);
                      }}
                      className={`text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer ${
                        darkMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-brand-olive hover:bg-brand-cream/40'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>العودة لتعديل الإعدادات</span>
                    </button>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>MP4 عالي الدقة</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Audio Source Summary */}
              {audioData && !error && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                    darkMode
                      ? 'bg-zinc-900/50 border-zinc-800 text-zinc-300'
                      : 'bg-brand-cream/35 border-brand-olive/15 text-brand-ink/85'
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-brand-olive dark:text-brand-gold shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">{audioData.sourceNote}</p>
                    <p className="text-[11px] opacity-70">
                      {audioData.isAuthenticQuran
                        ? 'تلاوة استوديو أصلية مدمجة بدقة 44.1kHz وموازنة صوتية احترافية.'
                        : 'لم يُعثر على مرجع سورة وآية قرآنية، فتم توليد إلقاء صوتي روحاني هادئ تلقائياً.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls Column (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-5">
              {/* 1. Distinguished Reciter Picker */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-brand-gold">
                    <Volume2 className="w-4 h-4" />
                    <span>اختر القارئ المميز لتلاوة الآيات القرآنية</span>
                  </label>
                  <span className="text-[11px] opacity-60">6 قراء بجودة استوديو</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {QURAN_RECITERS.map((reciter) => {
                    const active = selectedReciter === reciter.id;
                    return (
                      <button
                        key={reciter.id}
                        type="button"
                        disabled={exporting}
                        onClick={() => onSelectReciter(reciter.id)}
                        className={`p-3 rounded-2xl border text-right transition-all flex items-start justify-between gap-2 cursor-pointer disabled:opacity-50 ${
                          active
                            ? 'bg-brand-olive text-white border-brand-olive shadow-md'
                            : darkMode
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-brand-gold/50'
                            : 'bg-white border-brand-olive/15 text-brand-ink hover:border-brand-olive/40'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold truncate">{reciter.name}</p>
                          <p
                            className={`text-[11px] truncate ${
                              active ? 'text-white/80' : 'opacity-65'
                            }`}
                          >
                            {reciter.style}
                          </p>
                        </div>
                        {active && (
                          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Audio Content Mode + Independent Spoken Switches */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-brand-gold">
                  <Music className="w-4 h-4" />
                  <span>محتوى المسار الصوتي في الفيديو</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      {
                        id: 'verse',
                        label: 'تلاوة الآية بصوت القارئ',
                        hint: 'خاشعة ومختصرة للريلز',
                        disabled: !post.verseText?.trim(),
                        active:
                          audioMode === 'verse' && !includeReflectionInAudio && !includeCitationInAudio,
                      },
                      {
                        id: 'full',
                        label: 'الآية + الخاطرة والشاهد',
                        hint: 'تلاوة ثم إلقاء الخاطرة والشاهد',
                        disabled: !post.verseText?.trim() || (!post.content?.trim() && !activeCitation),
                        active:
                          (audioMode === 'full' || (audioMode === 'verse' && (includeReflectionInAudio || includeCitationInAudio))),
                      },
                      {
                        id: 'reflection',
                        label: 'إلقاء النص فقط',
                        hint: 'صوت روحاني بدون تلاوة الآية',
                        disabled: !post.content?.trim() && !post.topic?.trim() && !activeCitation,
                        active: audioMode === 'reflection',
                      },
                    ] as Array<{
                      id: VideoAudioMode;
                      label: string;
                      hint: string;
                      disabled: boolean;
                      active: boolean;
                    }>
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      disabled={mode.disabled || exporting}
                      onClick={() => handleSelectAudioPreset(mode.id)}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer disabled:opacity-40 ${
                        mode.active
                          ? darkMode
                            ? 'bg-brand-gold/15 border-brand-gold text-brand-gold'
                            : 'bg-brand-olive/10 border-brand-olive text-brand-olive'
                          : darkMode
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          : 'bg-white border-brand-olive/15 text-brand-ink/80 hover:border-brand-olive/35'
                      }`}
                    >
                      <p className="text-xs font-bold">{mode.label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{mode.hint}</p>
                    </button>
                  ))}
                </div>

                {/* Independent Spoken Audio Toggles for Reflection & Supporting Citation */}
                <div
                  className={`p-3 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-2.5 ${
                    darkMode
                      ? 'bg-zinc-900/75 border-zinc-800'
                      : 'bg-brand-cream/35 border-brand-olive/15'
                  }`}
                >
                  <label className="flex items-center justify-between gap-2 text-xs font-semibold cursor-pointer select-none">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={exporting || (!post.content?.trim() && !post.topic?.trim())}
                        checked={includeReflectionInAudio}
                        onChange={(e) => handleToggleReflectionAudio(e.target.checked)}
                        className="w-4 h-4 accent-brand-olive rounded cursor-pointer"
                      />
                      <span>قراءة الخاطرة صوتياً</span>
                    </span>
                    <span className="text-[10px] opacity-65">
                      {includeReflectionInAudio ? 'مقروءة' : 'صامتة'}
                    </span>
                  </label>

                  <label
                    className={`flex items-center justify-between gap-2 text-xs font-semibold cursor-pointer select-none ${
                      !activeCitation ? 'opacity-45 pointer-events-none' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={exporting || !activeCitation}
                        checked={Boolean(activeCitation && includeCitationInAudio)}
                        onChange={(e) => handleToggleCitationAudio(e.target.checked)}
                        className="w-4 h-4 accent-brand-olive rounded cursor-pointer"
                      />
                      <span>قراءة الشاهد الداعم صوتياً</span>
                    </span>
                    <span className="text-[10px] opacity-65">
                      {activeCitation && includeCitationInAudio ? 'مقروء' : 'صامت'}
                    </span>
                  </label>
                </div>
              </div>

              {/* 3. Visual Style, Motion & Aspect Ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-brand-gold">
                    <Sparkles className="w-4 h-4" />
                    <span>نمط الحركة والتأثير البصري</span>
                  </label>
                  <div className="space-y-1.5">
                    {(
                      [
                        {
                          id: 'kenburns',
                          label: 'سينمائي هادئ (تقريب ناعم HD)',
                          sub: 'تصدير سريع فائق الحدة للنصوص',
                        },
                        {
                          id: 'waveform',
                          label: 'موجة صوتية حية + بريق ذهبي',
                          sub: 'موجات تتفاعل مع صوت القارئ',
                        },
                        {
                          id: 'static',
                          label: 'لوحة ثابتة فائقة الوضوح',
                          sub: 'أسرع تصدير بحجم مثالي لواتساب',
                        },
                      ] as Array<{ id: VideoMotionStyle; label: string; sub: string }>
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        disabled={exporting}
                        onClick={() => setMotionStyle(m.id)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 ${
                          motionStyle === m.id
                            ? darkMode
                              ? 'bg-zinc-800 border-brand-gold text-white'
                              : 'bg-brand-olive text-white border-brand-olive'
                            : darkMode
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                            : 'bg-white border-brand-olive/15 text-brand-ink hover:border-brand-olive/35'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{m.label}</p>
                          <p className={`text-[10px] ${motionStyle === m.id ? 'opacity-80' : 'opacity-60'}`}>
                            {m.sub}
                          </p>
                        </div>
                        {motionStyle === m.id && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-brand-gold">
                      <Sliders className="w-4 h-4" />
                      <span>أبعاد الفيديو (بدون أي تشويه)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ASPECT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={exporting}
                          onClick={() => onChangeAspectRatio(opt.id)}
                          className={`px-3 py-2 rounded-xl border text-center transition-all cursor-pointer disabled:opacity-50 ${
                            aspectRatio === opt.id
                              ? 'bg-brand-olive text-white border-brand-olive'
                              : darkMode
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                              : 'bg-white border-brand-olive/15 text-brand-ink hover:border-brand-olive/35'
                          }`}
                        >
                          <p className="text-xs font-bold tabular-nums">{opt.label}</p>
                          <p className={`text-[10px] ${aspectRatio === opt.id ? 'opacity-85' : 'opacity-60'}`}>
                            {opt.hint}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold block opacity-85">إخراج البطاقة داخل الفيديو</label>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        disabled={exporting}
                        onClick={() => handleSelectVisualLayout('simple-vertical')}
                        className={`w-full py-2.5 px-3 rounded-xl text-right border transition-all cursor-pointer flex items-center justify-between gap-2 disabled:opacity-50 ${
                          visualLayout === 'simple-vertical'
                            ? 'bg-brand-gold text-zinc-950 border-brand-gold shadow-sm'
                            : darkMode
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-brand-gold/50'
                            : 'bg-white border-brand-olive/20 text-brand-ink hover:border-brand-olive/45'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold leading-snug">
                            وضع بسيط (صورة عمودية كاملة + الآية فقط)
                          </p>
                          <p
                            className={`text-[10px] mt-0.5 ${
                              visualLayout === 'simple-vertical' ? 'text-zinc-900/80' : 'opacity-65'
                            }`}
                          >
                            النص القرآني فقط كما في المنشور مع قراءة الخاطرة والشاهد حسب اختيارك
                          </p>
                        </div>
                        {visualLayout === 'simple-vertical' && <Check className="w-4 h-4 shrink-0" />}
                      </button>

                      <button
                        type="button"
                        disabled={exporting}
                        onClick={() => handleSelectVisualLayout('verse-synced')}
                        className={`w-full py-2.5 px-3 rounded-xl text-right border transition-all cursor-pointer flex items-center justify-between gap-2 disabled:opacity-50 ${
                          visualLayout === 'verse-synced'
                            ? 'bg-brand-gold text-zinc-950 border-brand-gold shadow-sm'
                            : darkMode
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-brand-gold/50'
                            : 'bg-white border-brand-olive/20 text-brand-ink hover:border-brand-olive/45'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold leading-snug">
                            الآية على الصورة + ظهور الخاطرة متزامناً
                          </p>
                          <p
                            className={`text-[10px] mt-0.5 ${
                              visualLayout === 'verse-synced' ? 'text-zinc-900/80' : 'opacity-65'
                            }`}
                          >
                            عرض متتابع للخاطرة جملة جملة أو كلمة كلمة مع الصوت
                          </p>
                        </div>
                        {visualLayout === 'verse-synced' && <Check className="w-4 h-4 shrink-0" />}
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          disabled={exporting}
                          onClick={() => handleSelectVisualLayout('cinema')}
                          className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                            visualLayout === 'cinema'
                              ? 'bg-brand-gold text-zinc-950 border-brand-gold'
                              : darkMode
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                              : 'bg-white border-brand-olive/15 text-brand-ink/80'
                          }`}
                        >
                          ريلز سينمائي كامل
                        </button>
                        <button
                          type="button"
                          disabled={exporting}
                          onClick={() => handleSelectVisualLayout('match')}
                          className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                            visualLayout === 'match'
                              ? 'bg-brand-gold text-zinc-950 border-brand-gold'
                              : darkMode
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                              : 'bg-white border-brand-olive/15 text-brand-ink/80'
                          }`}
                        >
                          مطابق لقالب البطاقة
                        </button>
                      </div>
                    </div>

                    {visualLayout === 'simple-vertical' && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                          darkMode
                            ? 'bg-zinc-900/80 border-brand-gold/30 text-zinc-300'
                            : 'bg-brand-cream/40 border-brand-olive/20 text-brand-ink/80'
                        }`}
                      >
                        يظهر على الصورة العمودية الكاملة النص القرآني فقط كما في المنشور، ويمكنك تفعيل أو إيقاف قراءة الخاطرة والشاهد الداعم من الخيارات الصوتية أعلاه.
                      </div>
                    )}

                    {visualLayout === 'verse-synced' && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl border space-y-2 ${
                          darkMode
                            ? 'bg-zinc-900/80 border-brand-gold/30'
                            : 'bg-brand-cream/40 border-brand-olive/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold flex items-center gap-1.5 text-brand-olive dark:text-brand-gold">
                            <Type className="w-3.5 h-3.5" />
                            <span>طريقة ظهور الخاطرة مع الصوت</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            [
                              {
                                id: 'sentences',
                                label: 'جملة جملة',
                                sub: 'تتابع هادئ',
                                disabled: !post.content?.trim(),
                              },
                              {
                                id: 'words',
                                label: 'كلمة كلمة',
                                sub: 'توهّج مع النطق',
                                disabled: !post.content?.trim(),
                              },
                              {
                                id: 'none',
                                label: 'الآية فقط',
                                sub: 'بدون خاطرة',
                                disabled: false,
                              },
                            ] as Array<{
                              id: ReflectionRevealMode;
                              label: string;
                              sub: string;
                              disabled: boolean;
                            }>
                          ).map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              disabled={opt.disabled || exporting}
                              onClick={() => handleSelectReflectionRevealMode(opt.id)}
                              className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer disabled:opacity-40 ${
                                reflectionRevealMode === opt.id
                                  ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
                                  : darkMode
                                  ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-brand-gold/40'
                                  : 'bg-white border-brand-olive/15 text-brand-ink hover:border-brand-olive/40'
                              }`}
                            >
                              <p className="text-[11px] font-bold leading-tight">{opt.label}</p>
                              <p
                                className={`text-[9px] mt-0.5 ${
                                  reflectionRevealMode === opt.id ? 'opacity-85' : 'opacity-60'
                                }`}
                              >
                                {opt.sub}
                              </p>
                            </button>
                          ))}
                        </div>

                        {activeRevealMode !== 'none' &&
                          post.content?.trim() &&
                          audioData &&
                          !audioData.timeline.hasReflectionAudio && (
                            <div className="flex items-center justify-between gap-2 pt-1 text-[10px]">
                              <span className="opacity-75">
                                لتزامن الخاطرة مع صوت قراءتها، فعّل مسار «الآية + قراءة الخاطرة».
                              </span>
                              <button
                                type="button"
                                disabled={exporting}
                                onClick={() => handleSelectAudioPreset('full')}
                                className="shrink-0 px-2 py-1 rounded-md bg-brand-olive text-white font-bold cursor-pointer hover:bg-brand-olive/90"
                              >
                                تفعيل الصوت
                              </button>
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  {citations.length > 0 && (
                    <div
                      className={`p-2.5 rounded-xl border space-y-2 ${
                        darkMode
                          ? 'bg-zinc-900/75 border-zinc-800'
                          : 'bg-brand-cream/35 border-brand-olive/15'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold flex items-center gap-1.5 text-brand-olive dark:text-brand-gold">
                          <Quote className="w-3.5 h-3.5" />
                          <span>
                            {visualLayout === 'simple-vertical'
                              ? 'اختيار الشاهد الداعم (للصوت)'
                              : 'الشاهد الداعم داخل الفيديو'}
                          </span>
                        </span>
                        {visualLayout !== 'simple-vertical' && (
                          <label className="flex items-center gap-1.5 text-[11px] font-bold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              disabled={exporting}
                              checked={effectiveShowCitation}
                              onChange={(e) => handleToggleCitation(e.target.checked)}
                              className="w-4 h-4 accent-brand-olive rounded cursor-pointer"
                            />
                            <span>{effectiveShowCitation ? 'ظاهر' : 'مخفي'}</span>
                          </label>
                        )}
                      </div>

                      {(effectiveShowCitation || visualLayout === 'simple-vertical') && (
                        <>
                          <div className="flex flex-wrap gap-1.5">
                            {citations.map((cit, idx) => (
                              <button
                                key={`${cit.type}-${idx}`}
                                type="button"
                                disabled={exporting}
                                onClick={() => handleSelectCitation(idx)}
                                className={`px-2.5 py-1.5 min-h-[34px] rounded-lg border text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
                                  idx === safeCitationIndex
                                    ? 'bg-brand-olive text-white border-brand-olive'
                                    : darkMode
                                    ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-brand-gold/40'
                                    : 'bg-white border-brand-olive/15 text-brand-ink hover:border-brand-olive/40'
                                }`}
                              >
                                {cit.label || CITATION_TYPE_LABELS[cit.type]}
                              </button>
                            ))}
                          </div>

                          <label className="flex items-center justify-between gap-2 pt-1.5 border-t border-brand-olive/10 dark:border-zinc-800 text-[11px] font-semibold cursor-pointer select-none">
                            <span className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                disabled={exporting}
                                checked={includeCitationInAudio}
                                onChange={(e) => handleToggleCitationAudio(e.target.checked)}
                                className="w-4 h-4 accent-brand-olive rounded cursor-pointer"
                              />
                              <span>قراءة الشاهد الداعم صوتياً</span>
                            </span>
                            <span className="text-[10px] opacity-65">
                              {includeCitationInAudio ? 'مفعّل' : 'متوقف'}
                            </span>
                          </label>
                        </>
                      )}
                    </div>
                  )}

                  <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={showReciterCredit}
                      onChange={(e) => setShowReciterCredit(e.target.checked)}
                      className="w-4 h-4 accent-brand-olive rounded cursor-pointer"
                    />
                    <span>إظهار اسم القارئ أسفل البطاقة</span>
                  </label>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 rounded-xl border bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Export Progress Bar */}
              {exporting && (
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-brand-olive/15'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-brand-olive dark:text-brand-gold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{exportStatus}</span>
                    </span>
                    <span className="tabular-nums">{exportProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-brand-olive/15 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-brand-olive dark:bg-brand-gold transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                {!exportedVideoUrl ? (
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={handleExportVideo}
                      disabled={loadingAudio || !audioData || exporting}
                      className="flex-1 py-3.5 px-6 min-h-[50px] rounded-2xl bg-brand-olive text-white font-bold text-sm hover:bg-brand-olive/95 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-brand-olive/20 disabled:opacity-45 cursor-pointer"
                    >
                      {exporting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>جاري إنتاج الفيديو عالي الدقة...</span>
                        </>
                      ) : (
                        <>
                          <Film className="w-5 h-5" />
                          <span>إنتاج وتصدير الفيديو بالصوت (MP4 HD)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadAudioOnly}
                      disabled={loadingAudio || !audioData || exporting}
                      title="تحميل التلاوة الصوتية فقط بجودة استوديو"
                      className={`py-3.5 px-4 min-h-[50px] rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-45 cursor-pointer ${
                        darkMode
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                          : 'bg-white border-brand-olive/20 text-brand-olive hover:bg-brand-cream/40'
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      <span>الصوت فقط</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadMp4}
                      className="sm:col-span-1 py-3.5 px-4 min-h-[48px] rounded-2xl bg-brand-olive text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-brand-olive/90 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل الفيديو (MP4)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareVideo}
                      className="sm:col-span-1 py-3.5 px-4 min-h-[48px] rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>مشاركة / واتساب</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadAudioOnly}
                      className={`sm:col-span-1 py-3.5 px-4 min-h-[48px] rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        darkMode
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                          : 'bg-white border-brand-olive/20 text-brand-olive hover:bg-brand-cream/40'
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      <span>تحميل الصوت (WAV)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
