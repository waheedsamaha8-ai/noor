import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Settings,
  Moon,
  Sun,
  KeyRound,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Power,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  AiKeyManagerConfig,
  KeyRotationMode,
  addUserAiKeys,
  loadAiKeyConfig,
  markKeyTestResult,
  maskApiKey,
  removeUserAiKey,
  resetAllKeyCooldowns,
  subscribeAiKeyConfig,
  toggleUserAiKey,
  updateAiKeySettings,
  verifyUserGeminiKey,
} from '../services/aiKeyManager';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: (next: boolean) => void;
  onNotify: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  onNotify,
}) => {
  const [config, setConfig] = useState<AiKeyManagerConfig>(() => loadAiKeyConfig());
  const [keyInput, setKeyInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'warn'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setConfig(loadAiKeyConfig());
    const unsub = subscribeAiKeyConfig(setConfig);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      unsub();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const now = Date.now();
  const activeEnabledCount = config.keys.filter(
    (k) => k.enabled && k.lastStatus !== 'invalid' && k.cooldownUntil <= now
  ).length;
  const hasCooledKeys = config.keys.some((k) => k.cooldownUntil > now || k.lastStatus === 'invalid');

  const handleAddKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    const result = addUserAiKeys(keyInput, labelInput);
    setConfig(result.config);

    if (result.addedCount > 0) {
      setKeyInput('');
      setLabelInput('');
      const msg =
        result.addedCount === 1
          ? 'تمت إضافة المفتاح وتفعيله ضمن التدوير التلقائي الذكي.'
          : `تمت إضافة ${result.addedCount} مفاتيح وتفعيل التدوير التلقائي الذكي بينها.`;
      setFeedback({ type: 'ok', text: msg });
      onNotify(msg);
    } else if (result.duplicateCount > 0) {
      setFeedback({ type: 'warn', text: 'هذا المفتاح مضاف بالفعل في قائمتك.' });
    } else {
      setFeedback({
        type: 'warn',
        text: 'تأكد من لصق مفتاح Gemini API صحيح (بدون مسافات، لا يقل عن 20 حرفاً).',
      });
    }
  };

  const handleTestKey = async (id: string, rawKey: string) => {
    setTestingKeyId(id);
    setFeedback(null);
    const result = await verifyUserGeminiKey(rawKey);
    const updated = markKeyTestResult(id, result);
    setConfig(updated);
    setTestingKeyId(null);
    setFeedback({
      type: result.valid ? 'ok' : 'warn',
      text: result.message,
    });
  };

  const handleChangeRotation = (mode: KeyRotationMode) => {
    const updated = updateAiKeySettings({ rotationMode: mode });
    setConfig(updated);
    onNotify(
      mode === 'smart-rotate'
        ? 'تم تفعيل التدوير التلقائي الذكي بين المفاتيح'
        : 'تم تفعيل وضع التحويل التلقائي عند نفاد الحصة فقط'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-5 overflow-hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="إعدادات التطبيق"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden max-h-[94dvh] flex flex-col ${
          darkMode
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-[#FBF9F5] border-brand-olive/20 text-brand-ink'
        }`}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-brand-olive/25 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div
          className={`px-4 sm:px-6 py-3.5 sm:py-4 border-b flex items-center justify-between gap-3 shrink-0 ${
            darkMode ? 'border-zinc-800 bg-zinc-900/70' : 'border-brand-olive/10 bg-white'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-olive text-white flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-brand-gold" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold serif leading-tight">إعدادات تطبيق نور</h2>
              <p className="text-[11px] sm:text-xs opacity-65 mt-0.5 truncate">
                المظهر، التثبيت على الجوال، وإدارة مفاتيح الذكاء الاصطناعي بالتدوير الذكي
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق الإعدادات"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
              darkMode
                ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                : 'border-brand-olive/15 hover:bg-brand-cream text-brand-ink'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 pb-8">
          {/* 1. Theme / Dark Mode Section */}
          <section
            className={`p-4 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-brand-olive/15'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-olive/12 dark:bg-brand-gold/15 text-brand-olive dark:text-brand-gold flex items-center justify-center shrink-0">
                  {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold">المظهر والوضع الليلي</h3>
                  <p className="text-xs opacity-65 mt-0.5">
                    {darkMode ? 'الوضع الليلي الداكن مفعّل لراحة العين' : 'الوضع النهاري العاجي مفعّل'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onToggleDarkMode(false)}
                className={`py-2.5 px-3 min-h-[46px] rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !darkMode
                    ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <Sun className="w-4 h-4 shrink-0" />
                <span>الوضع النهاري</span>
                {!darkMode && <Check className="w-4 h-4 shrink-0" />}
              </button>
              <button
                type="button"
                onClick={() => onToggleDarkMode(true)}
                className={`py-2.5 px-3 min-h-[46px] rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-brand-gold text-zinc-950 border-brand-gold shadow-sm'
                    : 'bg-brand-cream/50 border-brand-olive/15 text-brand-ink hover:border-brand-olive/40'
                }`}
              >
                <Moon className="w-4 h-4 shrink-0" />
                <span>الوضع الليلي</span>
                {darkMode && <Check className="w-4 h-4 shrink-0" />}
              </button>
            </div>
          </section>

          {/* 2. PWA Mobile Install Section */}
          <PWAInstallButton
            darkMode={darkMode}
            variant="card"
            onInstalled={() => onNotify('تم تثبيت تطبيق نور على جهازك بنجاح')}
          />

          {/* 3. Smart Multi-Key AI Rotation Manager */}
          <section
            className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              darkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-brand-olive/15'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-brand-olive/12 dark:bg-brand-gold/15 text-brand-olive dark:text-brand-gold flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold leading-snug">
                    إدارة مفاتيح الذكاء الاصطناعي والتدوير الذكي
                  </h3>
                  <p className="text-xs opacity-65 mt-0.5 leading-relaxed">
                    أضف مفتاح Gemini API أو أكثر، وسيتولى النظام التدوير التلقائي الذكي والتحويل الفوري عند نفاد الحصة.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold tabular-nums text-brand-olive dark:text-brand-gold shrink-0">
                {activeEnabledCount}/{config.keys.length} نشط
              </span>
            </div>

            {/* Privacy Assurance */}
            <div
              className={`p-3 rounded-xl border text-[11px] sm:text-xs flex items-start gap-2 leading-relaxed ${
                darkMode
                  ? 'bg-emerald-950/25 border-emerald-900/40 text-emerald-300'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                خصوصية تامة: تُحفظ مفاتيحك محلياً على جهازك فقط، ولا تُخزَّن على الخادم ولا يطّلع عليها أي مستخدم آخر.
              </span>
            </div>

            {/* Rotation Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold block opacity-85">آلية التدوير بين المفاتيح</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleChangeRotation('smart-rotate')}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    config.rotationMode === 'smart-rotate'
                      ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
                      : darkMode
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      : 'bg-brand-cream/35 border-brand-olive/15 text-brand-ink hover:border-brand-olive/40'
                  }`}
                >
                  <p className="text-xs font-bold">تدوير تلقائي ذكي (موصى به)</p>
                  <p
                    className={`text-[10px] mt-0.5 leading-relaxed ${
                      config.rotationMode === 'smart-rotate' ? 'text-white/80' : 'opacity-65'
                    }`}
                  >
                    يوزّع الطلبات بالتناوب على المفاتيح النشطة ويتجاوز المفتاح المجهد فوراً
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeRotation('failover-only')}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    config.rotationMode === 'failover-only'
                      ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
                      : darkMode
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      : 'bg-brand-cream/35 border-brand-olive/15 text-brand-ink hover:border-brand-olive/40'
                  }`}
                >
                  <p className="text-xs font-bold">التبديل عند نفاد الحصة فقط</p>
                  <p
                    className={`text-[10px] mt-0.5 leading-relaxed ${
                      config.rotationMode === 'failover-only' ? 'text-white/80' : 'opacity-65'
                    }`}
                  >
                    يعتمد على المفتاح الأول وينتقل تلقائياً للتالي فقط عند بلوغ الحد اليومي
                  </p>
                </button>
              </div>
            </div>

            {/* Fallback to server key toggle */}
            <label className="flex items-center justify-between gap-3 py-1 cursor-pointer select-none">
              <div>
                <p className="text-xs font-bold">استخدام مفتاح التطبيق الافتراضي كاحتياطي</p>
                <p className="text-[11px] opacity-65">
                  في حال لم تضف مفاتيح أو نفدت حصة مفاتيحك مؤقتاً، يعمل المفتاح الاحتياطي تلقائياً.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.fallbackToServerKey}
                onChange={(e) => {
                  const updated = updateAiKeySettings({ fallbackToServerKey: e.target.checked });
                  setConfig(updated);
                }}
                className="w-5 h-5 accent-brand-olive rounded cursor-pointer shrink-0"
              />
            </label>

            {/* Add Key(s) Form */}
            <form onSubmit={handleAddKeys} className="space-y-2.5 pt-2 border-t border-brand-olive/10 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold">إضافة مفتاح جديد (أو عدة مفاتيح، كل مفتاح في سطر)</label>
                <button
                  type="button"
                  onClick={() => setShowKeyText((v) => !v)}
                  className="text-[11px] font-bold opacity-70 hover:opacity-100 flex items-center gap-1 cursor-pointer"
                >
                  {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showKeyText ? 'إخفاء' : 'إظهار'}</span>
                </button>
              </div>

              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="اسم اختياري للمفتاح (مثال: مفتاحي الشخصي، حساب ثانٍ)..."
                className={`w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                  darkMode
                    ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-brand-gold/30'
                    : 'bg-brand-cream/25 border-brand-olive/15 text-brand-ink placeholder:text-brand-ink/45 focus:ring-brand-olive/20'
                }`}
              />

              {showKeyText ? (
                <textarea
                  rows={2}
                  dir="ltr"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIzaSy... (يمكن لصق أكثر من مفتاح، كل مفتاح في سطر منفصل)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 resize-none ${
                    darkMode
                      ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-brand-gold/30'
                      : 'bg-brand-cream/25 border-brand-olive/15 text-brand-ink placeholder:text-brand-ink/45 focus:ring-brand-olive/20'
                  }`}
                />
              ) : (
                <input
                  type="password"
                  dir="ltr"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIzaSy... (اضغط «إظهار» للصق عدة مفاتيح دفعة واحدة)"
                  className={`w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-brand-gold/30'
                      : 'bg-brand-cream/25 border-brand-olive/15 text-brand-ink placeholder:text-brand-ink/45 focus:ring-brand-olive/20'
                  }`}
                />
              )}

              <button
                type="submit"
                disabled={!keyInput.trim()}
                className="w-full py-2.5 px-4 min-h-[46px] rounded-xl bg-brand-olive text-white font-bold text-xs sm:text-sm hover:bg-brand-olive/90 transition-colors disabled:opacity-45 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-brand-gold" />
                <span>إضافة المفتاح وتفعيل التدوير التلقائي</span>
              </button>
            </form>

            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  feedback.type === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300'
                    : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300'
                }`}
              >
                {feedback.type === 'ok' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* User Keys List */}
            {config.keys.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold opacity-80">
                    مفاتيحك المضافة ({config.keys.length})
                  </p>
                  {hasCooledKeys && (
                    <button
                      type="button"
                      onClick={() => {
                        setConfig(resetAllKeyCooldowns());
                        onNotify('تمت إعادة تنشيط جميع المفاتيح بنجاح');
                      }}
                      className="text-[11px] font-bold text-brand-olive dark:text-brand-gold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>إعادة تنشيط المفاتيح</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {config.keys.map((item, idx) => {
                    const isCooling = item.cooldownUntil > now;
                    const remainMins = isCooling
                      ? Math.max(1, Math.ceil((item.cooldownUntil - now) / 60000))
                      : 0;
                    const statusLabel = !item.enabled
                      ? 'موقوف'
                      : item.lastStatus === 'invalid'
                      ? 'تحقق من الصلاحية'
                      : isCooling
                      ? `راحة مؤقتة (${remainMins} د)`
                      : item.lastStatus === 'active'
                      ? 'نشط ويعمل'
                      : 'جاهز للتدوير';

                    const statusColor = !item.enabled
                      ? 'text-zinc-500'
                      : item.lastStatus === 'invalid'
                      ? 'text-red-600 dark:text-red-400'
                      : isCooling
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400';

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          darkMode
                            ? 'bg-zinc-950/80 border-zinc-800'
                            : 'bg-brand-cream/30 border-brand-olive/15'
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold">
                              {idx + 1}. {item.label || `مفتاح ${idx + 1}`}
                            </span>
                            <span className={`text-[11px] font-bold ${statusColor}`}>
                              · {statusLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] opacity-65 tabular-nums">
                            <span dir="ltr" className="font-mono">
                              {maskApiKey(item.key)}
                            </span>
                            <span>الاستخدام: {item.usageCount}</span>
                          </div>
                          {item.lastError && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">
                              {item.lastError}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={testingKeyId === item.id}
                            onClick={() => handleTestKey(item.id, item.key)}
                            className={`px-2.5 py-1.5 min-h-[38px] rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 ${
                              darkMode
                                ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                                : 'bg-white border-brand-olive/20 text-brand-olive hover:bg-brand-olive hover:text-white'
                            }`}
                          >
                            {testingKeyId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>فحص</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfig(toggleUserAiKey(item.id))}
                            title={item.enabled ? 'إيقاف مؤقت' : 'تفعيل المفتاح'}
                            aria-label={item.enabled ? 'إيقاف المفتاح مؤقتاً' : 'تفعيل المفتاح'}
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                              item.enabled
                                ? 'bg-emerald-600/15 border-emerald-600/30 text-emerald-600 dark:text-emerald-400'
                                : darkMode
                                ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                                : 'bg-white border-brand-olive/15 text-brand-ink/40'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setConfig(removeUserAiKey(item.id));
                              onNotify('تم حذف المفتاح من جهازك');
                            }}
                            title="حذف المفتاح"
                            aria-label="حذف المفتاح"
                            className="w-9 h-9 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </div>
  );
};
