import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Download,
  Share2,
  Loader2,
  Check,
  Sparkles,
  Image as ImageIcon,
  Quote,
  Layout,
} from 'lucide-react';
import { GeneratedPost } from '../services/geminiService';
import { CITATION_TYPE_LABELS, SupportingCitation } from '../utils/categoryEditorial';
import {
  POSTER_DESIGN_STYLES,
  POSTER_EXPORT_FORMATS,
  PosterDesignStyle,
  PosterExportFormat,
  PosterRenderConfig,
  exportVerticalPosterBlob,
  getPosterFormatSpec,
  renderVerticalSocialPosterCanvas,
} from '../services/posterExportService';

interface ImageExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  post: GeneratedPost;
  imageUrl: string;
  fontFamily: string;
  fontFamilyCss: string;
  cardAccentColor: string;
  cardFrameStyle: 'clean' | 'gold-border';
  overlayOpacity: number;
  showTopic: boolean;
  showVersePrefix: boolean;
  showVerseText: boolean;
  showVerseReference: boolean;
  showSupportingCitation: boolean;
  activeCitationIndex: number;
  onSelectCitationIndex: (idx: number) => void;
  onToggleSupportingCitation: (show: boolean) => void;
  pageSignature: string;
  initialFormat?: PosterExportFormat;
  onNotify: (msg: string) => void;
}

export const ImageExportModal: React.FC<ImageExportModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  post,
  imageUrl,
  fontFamily,
  fontFamilyCss,
  cardAccentColor,
  cardFrameStyle,
  overlayOpacity,
  showTopic,
  showVersePrefix,
  showVerseText,
  showVerseReference,
  showSupportingCitation,
  activeCitationIndex,
  onSelectCitationIndex,
  onToggleSupportingCitation,
  pageSignature,
  initialFormat = 'whatsapp-9x16',
  onNotify,
}) => {
  const [format, setFormat] = useState<PosterExportFormat>(initialFormat);
  const [style, setStyle] = useState<PosterDesignStyle>('royal-editorial');
  const [rendering, setRendering] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const citations = post.citations || [];
  const safeCitationIdx = citations.length > 0 ? Math.min(activeCitationIndex, citations.length - 1) : 0;
  const activeCitation: SupportingCitation | null = citations[safeCitationIdx] || null;
  const spec = getPosterFormatSpec(format);

  useEffect(() => {
    if (isOpen && initialFormat) {
      setFormat(initialFormat);
    }
  }, [isOpen, initialFormat]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !exporting && !sharing) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, exporting, sharing, onClose]);

  const buildConfig = (): PosterRenderConfig => ({
    post,
    imageUrl,
    format,
    style,
    fontFamily,
    fontFamilyCss,
    cardAccentColor,
    cardFrameStyle,
    showTopic,
    showVersePrefix,
    showVerseText,
    showVerseReference,
    showSupportingCitation,
    activeCitation,
    pageSignature,
    overlayOpacity,
  });

  useEffect(() => {
    if (!isOpen || !imageUrl) return;
    let cancelled = false;
    setRendering(true);
    setError(null);

    renderVerticalSocialPosterCanvas(buildConfig())
      .then((rendered) => {
        if (cancelled) return;
        const target = previewCanvasRef.current;
        if (target) {
          target.width = rendered.width;
          target.height = rendered.height;
          const ctx = target.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, rendered.width, rendered.height);
            ctx.drawImage(rendered, 0, 0);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'تعذر معاينة البطاقة حالياً.');
        }
      })
      .finally(() => {
        if (!cancelled) setRendering(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    imageUrl,
    format,
    style,
    fontFamily,
    fontFamilyCss,
    cardAccentColor,
    cardFrameStyle,
    overlayOpacity,
    showTopic,
    showVersePrefix,
    showVerseText,
    showVerseReference,
    showSupportingCitation,
    safeCitationIdx,
    pageSignature,
    post,
  ]);

  if (!isOpen) return null;

  const handleDownloadPng = async () => {
    if (exporting) return;
    setExporting(true);
    setError(null);
    try {
      const blob = await exportVerticalPosterBlob(buildConfig());
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `noor-${spec.ratioLabel.replace(':', 'x')}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      onNotify(`تم حفظ الصورة العمودية فائقة الدقة (${spec.width}×${spec.height})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر حفظ الصورة حالياً.');
    } finally {
      setExporting(false);
    }
  };

  const handleSharePoster = async () => {
    if (sharing) return;
    setSharing(true);
    setError(null);
    try {
      const blob = await exportVerticalPosterBlob(buildConfig());
      const file = new File([blob], `noor-${spec.ratioLabel.replace(':', 'x')}.png`, {
        type: 'image/png',
      });
      const caption = [
        `✨ ${post.topic}`,
        post.content,
        post.verseText
          ? `📖 ${post.versePrefix || 'قال تعالى:'}\n﴿ ${post.verseText} ﴾\n${post.verseReference || ''}`
          : '',
        activeCitation && showSupportingCitation
          ? `${activeCitation.label}${activeCitation.prefix ? ` — ${activeCitation.prefix}` : ''}\n${activeCitation.text}${activeCitation.source ? `\n(${activeCitation.source})` : ''}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: post.topic,
          text: caption,
        });
        onNotify('تمت مشاركة الصورة العمودية بنجاح');
      } else {
        // Download crisp PNG + copy caption cleanly
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `noor-${spec.ratioLabel.replace(':', 'x')}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 4000);
        try {
          await navigator.clipboard.writeText(caption);
          onNotify('تم حفظ الصورة العمودية ونسخ النص جاهزاً للنشر على واتساب وفيسبوك');
        } catch {
          onNotify('تم حفظ الصورة العمودية جاهزة للمشاركة على واتساب وفيسبوك');
        }
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'تعذر مشاركة الصورة حالياً.');
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget && !exporting && !sharing) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className={`w-full max-w-5xl rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden max-h-[94dvh] sm:max-h-[92vh] flex flex-col ${
          darkMode
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-brand-cream border-brand-olive/20 text-brand-ink'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 sm:px-6 py-3.5 sm:py-4 border-b flex items-center justify-between gap-3 ${
            darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-brand-olive/10'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-olive text-white flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold truncate">
                تصدير صورة عمودية احترافية (واتساب · فيسبوك)
              </h3>
              <p className="text-[11px] sm:text-xs opacity-65 truncate">
                إخراج فني بدقة {spec.width}×{spec.height} · تنسيق تلقائي للخط والآيات والشواهد
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={exporting || sharing}
            aria-label="إغلاق"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-40 ${
              darkMode
                ? 'hover:bg-zinc-800 text-zinc-300'
                : 'hover:bg-brand-olive/10 text-brand-ink'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Live Vertical Canvas Preview */}
            <div className="lg:col-span-5 flex flex-col items-center space-y-2.5">
              <div
                className={`w-full rounded-2xl border overflow-hidden shadow-xl relative flex items-center justify-center ${
                  darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-900/5 border-brand-olive/15'
                }`}
                style={{
                  maxHeight: '58vh',
                  aspectRatio: `${spec.width} / ${spec.height}`,
                }}
              >
                <canvas
                  ref={previewCanvasRef}
                  className="w-full h-full object-contain block"
                />
                {rendering && (
                  <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 className="w-7 h-7 animate-spin text-brand-gold" />
                  </div>
                )}
              </div>
              <p className="text-[11px] font-semibold opacity-70 text-center tabular-nums">
                معاينة مطابقة تماماً للملف النهائي · {spec.ratioLabel} ({spec.width}×{spec.height}px)
              </p>
            </div>

            {/* Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* 1. Vertical Format Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-brand-gold">
                  <Layout className="w-4 h-4" />
                  <span>اختر المقاس العمودي المناسب لمنصة النشر</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {POSTER_EXPORT_FORMATS.map((item) => {
                    const active = format === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormat(item.id)}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer min-h-[54px] ${
                          active
                            ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
                            : darkMode
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-brand-gold/50'
                            : 'bg-white border-brand-olive/15 text-brand-ink hover:border-brand-olive/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold">{item.label}</span>
                          <span className="text-[11px] font-extrabold tabular-nums opacity-85">
                            {item.ratioLabel}
                          </span>
                        </div>
                        <p className={`text-[10px] mt-1 ${active ? 'text-white/80' : 'opacity-65'}`}>
                          {item.platformHint}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Luxury Editorial Theme Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-brand-gold">
                  <Sparkles className="w-4 h-4" />
                  <span>نمط الإخراج والتنسيق الفني</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {POSTER_DESIGN_STYLES.map((st) => {
                    const active = style === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStyle(st.id)}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer min-h-[54px] ${
                          active
                            ? darkMode
                              ? 'bg-brand-gold/15 border-brand-gold text-brand-gold'
                              : 'bg-brand-olive/10 border-brand-olive text-brand-olive'
                            : darkMode
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                            : 'bg-white border-brand-olive/15 text-brand-ink hover:border-brand-olive/35'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-bold">{st.label}</span>
                          {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </div>
                        <p className="text-[10px] opacity-70 mt-1">{st.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Supporting Citation Picker inside Image Export */}
              {citations.length > 0 && (
                <div
                  className={`p-3.5 rounded-2xl border space-y-2.5 ${
                    darkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-brand-olive/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-brand-olive dark:text-brand-gold">
                      <Quote className="w-4 h-4" />
                      <span>الشاهد الداعم داخل الصورة</span>
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSupportingCitation}
                        onChange={(e) => onToggleSupportingCitation(e.target.checked)}
                        className="w-4 h-4 accent-brand-olive"
                      />
                      <span>إظهار الشاهد في التصميم</span>
                    </label>
                  </div>
                  {showSupportingCitation && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {citations.map((cit, idx) => {
                        const selected = idx === safeCitationIdx;
                        return (
                          <button
                            key={`${cit.type}-${idx}`}
                            type="button"
                            onClick={() => onSelectCitationIndex(idx)}
                            className={`px-3 py-2 rounded-xl border text-right text-[11px] transition-all cursor-pointer min-h-[42px] ${
                              selected
                                ? 'bg-brand-olive text-white border-brand-olive'
                                : darkMode
                                ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-brand-gold/40'
                                : 'bg-brand-cream/40 border-brand-olive/15 text-brand-ink hover:border-brand-olive/40'
                            }`}
                          >
                            <p className="font-bold truncate">
                              {cit.label || CITATION_TYPE_LABELS[cit.type]}
                            </p>
                            <p className={`text-[10px] truncate mt-0.5 ${selected ? 'text-white/80' : 'opacity-65'}`}>
                              {cit.source || cit.text}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl border bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Export Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={exporting || rendering}
                  className="flex-1 py-3.5 px-5 min-h-[50px] rounded-2xl bg-brand-olive text-white font-bold text-sm hover:bg-brand-olive/95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-olive/20 cursor-pointer disabled:opacity-45"
                >
                  {exporting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  <span>حفظ الصورة بأعلى دقة ({spec.ratioLabel})</span>
                </button>
                <button
                  type="button"
                  onClick={handleSharePoster}
                  disabled={sharing || rendering}
                  className="py-3.5 px-5 min-h-[50px] rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45"
                >
                  {sharing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                  <span>مشاركة (واتساب / فيسبوك)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
