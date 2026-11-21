import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, Check, X, WifiOff } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  darkMode: boolean;
  variant?: 'header' | 'card';
  onInstalled?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  darkMode,
  variant = 'header',
  onInstalled,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled && variant === 'header') {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        onInstalled?.();
      }
      return;
    }
    setShowGuide(true);
  };

  if (variant === 'card') {
    return (
      <>
        <div
          className={`p-4 rounded-2xl border space-y-3 ${
            darkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-brand-olive/15'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-brand-olive/12 dark:bg-brand-gold/15 text-brand-olive dark:text-brand-gold flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold leading-snug">تثبيت تطبيق «نور» على الجوال</h3>
                <p className="text-xs opacity-65 mt-0.5 leading-relaxed">
                  {isInstalled
                    ? 'التطبيق مثبّت بالفعل على جهازك ويعمل بوضع التطبيق الكامل.'
                    : 'أضف «نور» إلى شاشتك الرئيسية لتشغيله كتطبيق مستقل وسريع بلمسة واحدة.'}
                </p>
              </div>
            </div>
            {isInstalled && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                <Check className="w-4 h-4" />
                <span>مثبّت</span>
              </span>
            )}
          </div>

          {!isInstalled && (
            <button
              type="button"
              onClick={handleClick}
              className="w-full py-3 px-4 min-h-[46px] rounded-xl bg-brand-olive text-white font-bold text-xs sm:text-sm hover:bg-brand-olive/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-brand-gold shrink-0" />
              <span>
                {isInstallable
                  ? 'تثبيت التطبيق الآن على الجهاز'
                  : isIOS
                  ? 'طريقة التثبيت على آيفون / آيباد'
                  : 'تثبيت التطبيق على الشاشة الرئيسية'}
              </span>
            </button>
          )}
        </div>

        {showGuide && (
          <InstallGuideModal
            darkMode={darkMode}
            isIOS={isIOS}
            isAndroid={isAndroid}
            onClose={() => setShowGuide(false)}
          />
        )}
      </>
    );
  }

  // Header compact install button (shows when natively installable or on mobile devices)
  if (!isInstallable && !isIOS && !isAndroid) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="تثبيت تطبيق نور على الجوال"
        aria-label="تثبيت تطبيق نور على الجوال"
        className={`px-3 py-2 min-h-[44px] rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
          darkMode
            ? 'bg-zinc-900 border-brand-gold/35 text-brand-gold hover:bg-zinc-800'
            : 'bg-white border-brand-olive/20 text-brand-olive hover:bg-brand-olive hover:text-white'
        }`}
      >
        <Smartphone className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">تثبيت التطبيق</span>
        <span className="sm:hidden">تثبيت</span>
      </button>

      {showGuide && (
        <InstallGuideModal
          darkMode={darkMode}
          isIOS={isIOS}
          isAndroid={isAndroid}
          onClose={() => setShowGuide(false)}
        />
      )}
    </>
  );
};

const InstallGuideModal: React.FC<{
  darkMode: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  onClose: () => void;
}> = ({ darkMode, isIOS, isAndroid, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="خطوات تثبيت تطبيق نور"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 ${
          darkMode
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-[#FBF9F5] border-brand-olive/20 text-brand-ink'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-olive text-white flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold serif">تثبيت تطبيق «نور» على الجوال</h3>
              <p className="text-[11px] opacity-65">
                {isIOS ? 'متصفح Safari على iPhone / iPad' : isAndroid ? 'متصفح Chrome على Android' : 'التثبيت السريع من المتصفح'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer ${
              darkMode ? 'border-zinc-800 hover:bg-zinc-900' : 'border-brand-olive/15 hover:bg-brand-cream'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <ol className="space-y-3 text-xs sm:text-sm leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-brand-olive text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                ١
              </span>
              <span>
                افتح الرابط مباشرة في متصفح <strong>Safari</strong> ثم اضغط على زر{' '}
                <strong className="inline-flex items-center gap-1">
                  المشاركة <Share className="w-3.5 h-3.5 inline" />
                </strong>{' '}
                في شريط المتصفح بالأسفل.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-brand-olive text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                ٢
              </span>
              <span>
                مرّر للأسفل واختر{' '}
                <strong className="inline-flex items-center gap-1">
                  إضافة إلى الشاشة الرئيسية <PlusSquare className="w-3.5 h-3.5 inline" />
                </strong>
                .
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-brand-olive text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                ٣
              </span>
              <span>اضغط <strong>إضافة (Add)</strong> وسيظهر تطبيق «نور» بأيقونته مباشرة على شاشتك.</span>
            </li>
          </ol>
        ) : (
          <ol className="space-y-3 text-xs sm:text-sm leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-brand-olive text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                ١
              </span>
              <span>
                افتح التطبيق في علامة تبويب مستقلة على متصفح <strong>Chrome</strong> أو{' '}
                <strong>Edge</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-brand-olive text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                ٢
              </span>
              <span>
                اضغط على قائمة المتصفح <strong>(⋮)</strong> أعلى الشاشة ثم اختر{' '}
                <strong>تثبيت التطبيق (Install App)</strong> أو <strong>الإضافة إلى الشاشة الرئيسية</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-brand-olive text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                ٣
              </span>
              <span>أكّد التثبيت ليعمل التطبيق بملء الشاشة بدون شريط المتصفح وبوصول فوري.</span>
            </li>
          </ol>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 min-h-[46px] rounded-xl bg-brand-olive text-white font-bold text-sm hover:bg-brand-olive/90 transition-colors cursor-pointer"
        >
          حسناً، فهمت
        </button>
      </div>
    </div>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-5 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>وضع عدم الاتصال — اللوحات والمحفوظات المحلية متاحة</span>
    </div>
  );
};
