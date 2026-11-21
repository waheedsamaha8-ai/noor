import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Maximize2, Check, Search, Layers } from 'lucide-react';
import { ASPECT_RATIOS, AspectRatio } from '../services/geminiService';
import {
  ARTWORK_CATEGORIES,
  ArtworkCategory,
  GRADIENT_BACKDROPS,
  GradientBackdrop,
  IslamicArtwork,
  LOCAL_ISLAMIC_ARTWORKS,
} from '../services/localArchive';

interface GalleryViewProps {
  darkMode: boolean;
  activeImageUrl: string | null;
  activeManuscriptId: string | null;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  hasActivePost: boolean;
  onSelectArtworkForDesign: (imageSrc: string, suggestedLabel?: string) => void;
  onSelectManuscriptForDesign: (backdrop: GradientBackdrop) => void;
}

const RATIO_PREVIEW_BOX: Record<AspectRatio, string> = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '3:4': 'aspect-[3/4]',
  '16:9': 'aspect-[16/9]',
  '9:16': 'aspect-[9/14]',
};

const RATIO_SHORT_LABELS: Record<AspectRatio, string> = {
  '1:1': 'مربع 1:1',
  '3:4': 'عمودي 3:4',
  '4:3': 'أفقي 4:3',
  '9:16': 'ستوري 9:16',
  '16:9': 'عرضي 16:9',
};

export const GalleryView: React.FC<GalleryViewProps> = ({
  darkMode,
  activeImageUrl,
  activeManuscriptId,
  aspectRatio,
  onChangeAspectRatio,
  hasActivePost,
  onSelectArtworkForDesign,
  onSelectManuscriptForDesign,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ArtworkCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);
  const [lightboxArtwork, setLightboxArtwork] = useState<IslamicArtwork | null>(null);

  const filteredArtworks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return LOCAL_ISLAMIC_ARTWORKS.filter((art) => {
      const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        art.label.toLowerCase().includes(query) ||
        art.subtitle.toLowerCase().includes(query) ||
        art.categoryLabel.toLowerCase().includes(query) ||
        art.keywords.some((kw) => kw.toLowerCase().includes(query))
      );
    });
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    setVisibleCount(24);
  }, [selectedCategory, searchTerm]);

  const visibleArtworks = useMemo(
    () => filteredArtworks.slice(0, visibleCount),
    [filteredArtworks, visibleCount]
  );

  useEffect(() => {
    if (!lightboxArtwork) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxArtwork(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxArtwork]);

  return (
    <motion.div
      key="gallery-step"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="max-w-6xl mx-auto space-y-8 sm:space-y-12 pb-8"
    >
      {/* Header */}
      <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto px-1">
        <p className="text-xs font-bold text-brand-olive dark:text-brand-gold tabular-nums">
          المكتبة الفوتوغرافية الموسّعة · {LOCAL_ISLAMIC_ARTWORKS.length} مشهداً فوتوغرافياً عالي الجودة · {GRADIENT_BACKDROPS.length} مخطوطة ديناميكية
        </p>
        <h2 className="text-2xl sm:text-4xl font-bold serif text-balance leading-snug">
          معرض المشاهد واللوحات الفوتوغرافية الإيمانية
        </h2>
        <p className="text-xs sm:text-base text-brand-ink/70 dark:text-zinc-400 leading-relaxed">
          مشاهد إسلامية فوتوغرافية حقيقية عالية الدقة من الحرمين والأقصى وأعرق المساجد والطبيعة، إلى جانب مخطوطات ديناميكية تتكيّف مع المقاس وطول النص.
        </p>
      </div>

      {/* Search + Category Filter Bar */}
      <div className="space-y-3">
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث في المشاهد (مثال: رمضان، فجر، مكة، بحر، مخطوطة)..."
            className={`w-full pr-10 pl-9 py-2.5 min-h-[46px] rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition-colors ${
              darkMode
                ? 'bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-brand-gold/30'
                : 'bg-white border-brand-olive/15 text-brand-ink placeholder:text-brand-ink/45 focus:ring-brand-olive/20'
            }`}
          />
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 opacity-45 pointer-events-none" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="مسح البحث"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center sm:justify-center gap-2 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap">
          {ARTWORK_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? LOCAL_ISLAMIC_ARTWORKS.length
                : LOCAL_ISLAMIC_ARTWORKS.filter((a) => a.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
                    : darkMode
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                      : 'bg-white border-brand-olive/15 text-brand-ink/75 hover:border-brand-olive/40 hover:text-brand-ink'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[11px] tabular-nums ${isActive ? 'text-white/80' : 'opacity-55'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media-First Editorial Grid — 2 columns on mobile, 3 columns on desktop */}
      {filteredArtworks.length === 0 ? (
        <div
          className={`p-10 rounded-2xl border border-dashed text-center space-y-3 ${
            darkMode ? 'border-zinc-800 bg-zinc-900/40' : 'border-brand-olive/20 bg-white/60'
          }`}
        >
          <p className="text-sm font-bold">لا توجد لوحات مطابقة للبحث «{searchTerm}»</p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 min-h-[42px] rounded-xl bg-brand-olive text-white text-xs font-bold cursor-pointer"
          >
            عرض جميع اللوحات ({LOCAL_ISLAMIC_ARTWORKS.length})
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {visibleArtworks.map((art, index) => {
              const isCurrent = activeImageUrl === art.src && !activeManuscriptId;
              return (
                <article
                  key={art.id}
                  className={`group rounded-2xl overflow-hidden border transition-all flex flex-col ${
                    isCurrent
                      ? 'border-brand-olive dark:border-brand-gold ring-2 ring-brand-olive/20 dark:ring-brand-gold/25'
                      : darkMode
                        ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-brand-olive/12 hover:border-brand-olive/30'
                  }`}
                >
                  {/* Artwork Canvas */}
                  <div
                    onClick={() => setLightboxArtwork(art)}
                    className="relative aspect-square overflow-hidden bg-zinc-900 cursor-pointer"
                  >
                    <img
                      src={art.src}
                      alt={art.label}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxArtwork(art);
                      }}
                      aria-label={`معاينة لوحة ${art.label} بالحجم الكامل`}
                      className="absolute top-2 left-2 sm:top-3 sm:left-3 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/55 text-white hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    {isCurrent && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-2.5 rounded-lg bg-brand-gold text-brand-ink text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>مُختارة</span>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4 text-right space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-[11px] font-medium text-white/75 tabular-nums truncate">
                        {String(index + 1).padStart(2, '0')} · {art.categoryLabel}
                      </p>
                      <h3 className="text-sm sm:text-lg font-bold text-white serif leading-snug line-clamp-2">
                        {art.label}
                      </h3>
                    </div>
                  </div>

                  {/* Clean Footer Info & Primary Action */}
                  <div
                    className={`p-2.5 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-4 flex-1 ${
                      darkMode ? 'bg-zinc-900' : 'bg-white'
                    }`}
                  >
                    <p className="text-[11px] sm:text-sm text-brand-ink/70 dark:text-zinc-400 leading-relaxed line-clamp-2">
                      {art.subtitle}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectArtworkForDesign(art.src, art.label)}
                      className={`w-full py-2 px-2.5 sm:py-2.5 sm:px-4 min-h-[42px] rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                        darkMode
                          ? 'bg-zinc-800 text-zinc-100 hover:bg-brand-olive hover:text-white'
                          : 'bg-brand-cream/70 text-brand-olive hover:bg-brand-olive hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">{hasActivePost ? 'تطبيق اللوحة' : 'صمّم بها'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {visibleCount < filteredArtworks.length && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="px-6 py-3 min-h-[46px] rounded-xl bg-brand-olive text-white text-xs sm:text-sm font-bold hover:bg-brand-olive/90 transition-colors cursor-pointer shadow-sm tabular-nums"
              >
                عرض المزيد من اللوحات ({filteredArtworks.length - visibleCount} متبقية)
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredArtworks.length)}
                className={`px-4 py-3 min-h-[46px] rounded-xl border text-xs sm:text-sm font-bold transition-colors cursor-pointer tabular-nums ${
                  darkMode
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    : 'bg-white border-brand-olive/20 text-brand-olive hover:bg-brand-cream/50'
                }`}
              >
                عرض الكل ({filteredArtworks.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Ornate Manuscript Backdrops Section */}
      <section className="pt-6 sm:pt-8 border-t border-brand-olive/10 dark:border-zinc-800 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-brand-olive dark:text-brand-gold tabular-nums">
              {GRADIENT_BACKDROPS.length} مخطوطات ديناميكية · متكيفة مع المقاس وطول النص
            </p>
            <h3 className="text-xl sm:text-2xl font-bold serif">
              خلفيات المخطوطات والزخارف الهندسية
            </h3>
            <p className="text-xs sm:text-sm text-brand-ink/70 dark:text-zinc-400 max-w-2xl leading-relaxed">
              تُعاد هندسة الإطار المزدوج والنجوم الثمانية والهوامش تلقائياً عند تغيير المقاس أو تعديل طول الخاطرة والآية لضمان تناسق تام بلا قصّ أو تداخل.
            </p>
          </div>

          {/* Interactive Aspect Ratio Selector for Live Manuscript Preview */}
          <div className="space-y-1.5 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-ink/60 dark:text-zinc-400">
              <Layers className="w-3.5 h-3.5 text-brand-olive dark:text-brand-gold" />
              <span>جرّب استجابة المخطوطات للمقاس:</span>
            </div>
            <div
              className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto no-scrollbar ${
                darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-brand-olive/15'
              }`}
            >
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => onChangeAspectRatio(ratio)}
                  className={`px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 tabular-nums cursor-pointer ${
                    aspectRatio === ratio
                      ? 'bg-brand-olive text-white shadow-sm'
                      : darkMode
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-brand-ink/70 hover:text-brand-ink'
                  }`}
                >
                  {RATIO_SHORT_LABELS[ratio]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
          {GRADIENT_BACKDROPS.map((backdrop) => {
            const isSelected = activeManuscriptId === backdrop.id;
            return (
              <button
                key={backdrop.id}
                type="button"
                onClick={() => onSelectManuscriptForDesign(backdrop)}
                style={{ background: backdrop.cssGradient }}
                className={`p-3.5 sm:p-5 rounded-2xl border text-right flex flex-col justify-between transition-all active:scale-[0.98] sm:hover:-translate-y-0.5 cursor-pointer relative overflow-hidden w-full ${
                  RATIO_PREVIEW_BOX[aspectRatio]
                } ${
                  isSelected
                    ? 'ring-2 ring-brand-gold border-brand-gold shadow-lg'
                    : backdrop.isDark
                      ? 'text-white border-white/15'
                      : 'text-brand-ink border-brand-olive/25'
                }`}
              >
                {/* Live Dynamic Double Islamic Frame matching the chosen Aspect Ratio */}
                <div
                  className="absolute inset-2 sm:inset-2.5 rounded-xl pointer-events-none border-[1.5px]"
                  style={{ borderColor: backdrop.ornamentColor }}
                />
                <div
                  className="absolute inset-3 sm:inset-3.5 rounded-lg pointer-events-none border"
                  style={{ borderColor: backdrop.ornamentColor, opacity: 0.65 }}
                />

                {/* Top Ornament Bar & Active Check */}
                <div className="relative z-10 flex items-start justify-between gap-2 w-full">
                  <span
                    className="text-sm sm:text-base font-bold serif leading-snug"
                    style={{ color: backdrop.textColor }}
                  >
                    {backdrop.name}
                  </span>
                  {isSelected ? (
                    <span className="w-6 h-6 rounded-full bg-brand-gold text-brand-ink flex items-center justify-center shrink-0 shadow">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span
                      className="text-[10px] font-bold tabular-nums opacity-70 shrink-0"
                      style={{ color: backdrop.accentColor }}
                    >
                      {aspectRatio}
                    </span>
                  )}
                </div>

                {/* Live Mini Manuscript Calligraphy Specimen */}
                <div className="relative z-10 my-auto py-1 text-center pointer-events-none">
                  <p
                    className="text-xs sm:text-sm serif font-bold opacity-85 truncate"
                    style={{ color: backdrop.accentColor }}
                  >
                    ﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾
                  </p>
                </div>

                {/* Footer Subtitle */}
                <div className="relative z-10 flex items-end justify-between gap-2 w-full">
                  <span
                    className="text-[10px] sm:text-[11px] opacity-80 leading-snug line-clamp-2"
                    style={{ color: backdrop.textColor }}
                  >
                    {backdrop.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Fullscreen Lightbox Modal — Bottom Sheet on Mobile */}
      <AnimatePresence>
        {lightboxArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxArtwork(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-8"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-3xl w-full rounded-t-3xl sm:rounded-3xl overflow-hidden border shadow-2xl max-h-[92dvh] flex flex-col ${
                darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-brand-olive/15'
              }`}
            >
              <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-black">
                <div className="w-10 h-1.5 rounded-full bg-white/30" />
              </div>
              <div className="relative bg-black max-h-[58dvh] sm:max-h-[65vh] flex items-center justify-center overflow-hidden">
                <img
                  src={lightboxArtwork.src}
                  alt={lightboxArtwork.label}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[58dvh] sm:max-h-[65vh] object-contain"
                />
                <button
                  type="button"
                  onClick={() => setLightboxArtwork(null)}
                  aria-label="إغلاق المعاينة"
                  className="absolute top-3 left-3 sm:top-4 sm:left-4 w-11 h-11 rounded-xl bg-black/70 text-white hover:bg-black flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 sm:p-6 pb-safe flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-brand-olive dark:text-brand-gold">
                    {lightboxArtwork.categoryLabel}
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold serif">{lightboxArtwork.label}</h3>
                  <p className="text-xs sm:text-sm text-brand-ink/70 dark:text-zinc-400">
                    {lightboxArtwork.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const art = lightboxArtwork;
                    setLightboxArtwork(null);
                    onSelectArtworkForDesign(art.src, art.label);
                  }}
                  className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-brand-olive text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{hasActivePost ? 'تطبيق على منشوري' : 'ابدأ التصميم بها'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
