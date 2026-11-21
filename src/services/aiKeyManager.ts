export type KeyRotationMode = 'smart-rotate' | 'failover-only';

export interface UserAiKeyEntry {
  id: string;
  label: string;
  key: string;
  enabled: boolean;
  addedAt: number;
  usageCount: number;
  cooldownUntil: number;
  lastStatus: 'ready' | 'active' | 'cooldown' | 'invalid';
  lastError?: string;
}

export interface AiKeyManagerConfig {
  keys: UserAiKeyEntry[];
  rotationMode: KeyRotationMode;
  fallbackToServerKey: boolean;
  nextIndex: number;
}

const STORAGE_KEY = 'noor_user_ai_keys_v1';
const DEFAULT_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
const MAX_KEYS = 15;

const DEFAULT_CONFIG: AiKeyManagerConfig = {
  keys: [],
  rotationMode: 'smart-rotate',
  fallbackToServerKey: true,
  nextIndex: 0,
};

type ConfigListener = (config: AiKeyManagerConfig) => void;
const listeners = new Set<ConfigListener>();

function emitChange(config: AiKeyManagerConfig) {
  listeners.forEach((fn) => {
    try {
      fn(config);
    } catch {
      // ignore listener errors
    }
  });
}

export function subscribeAiKeyConfig(listener: ConfigListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadAiKeyConfig(): AiKeyManagerConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_CONFIG };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw) as Partial<AiKeyManagerConfig>;
    const keys: UserAiKeyEntry[] = Array.isArray(parsed.keys)
      ? parsed.keys
          .filter(
            (k): k is UserAiKeyEntry =>
              Boolean(k) && typeof k.id === 'string' && typeof k.key === 'string' && k.key.trim().length > 10
          )
          .slice(0, MAX_KEYS)
          .map((k) => ({
            id: k.id,
            label: typeof k.label === 'string' ? k.label : '',
            key: k.key.trim(),
            enabled: k.enabled !== false,
            addedAt: typeof k.addedAt === 'number' ? k.addedAt : Date.now(),
            usageCount: typeof k.usageCount === 'number' ? k.usageCount : 0,
            cooldownUntil: typeof k.cooldownUntil === 'number' ? k.cooldownUntil : 0,
            lastStatus:
              k.lastStatus === 'active' ||
              k.lastStatus === 'cooldown' ||
              k.lastStatus === 'invalid'
                ? k.lastStatus
                : 'ready',
            lastError: typeof k.lastError === 'string' ? k.lastError : undefined,
          }))
      : [];

    return {
      keys,
      rotationMode: parsed.rotationMode === 'failover-only' ? 'failover-only' : 'smart-rotate',
      fallbackToServerKey: parsed.fallbackToServerKey !== false,
      nextIndex: typeof parsed.nextIndex === 'number' && parsed.nextIndex >= 0 ? parsed.nextIndex : 0,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveAiKeyConfig(config: AiKeyManagerConfig): AiKeyManagerConfig {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore quota errors
    }
  }
  emitChange(config);
  return config;
}

export function maskApiKey(rawKey: string): string {
  const k = rawKey.trim();
  if (k.length <= 10) return '••••••••';
  return `${k.slice(0, 6)}••••••${k.slice(-4)}`;
}

export function addUserAiKeys(rawInput: string, customLabel?: string): {
  addedCount: number;
  duplicateCount: number;
  invalidCount: number;
  config: AiKeyManagerConfig;
} {
  const config = loadAiKeyConfig();
  const tokens = rawInput
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  let addedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  const existingSet = new Set(config.keys.map((k) => k.key));
  const nextKeys = [...config.keys];

  for (const token of tokens) {
    if (nextKeys.length >= MAX_KEYS) break;
    // Basic format sanity check (Gemini keys are typically ~39 chars starting with AIza, allow generic ASCII tokens >= 20 chars)
    if (token.length < 20 || /\s/.test(token) || !/^[\x21-\x7E]+$/.test(token)) {
      invalidCount++;
      continue;
    }
    if (existingSet.has(token)) {
      duplicateCount++;
      continue;
    }
    existingSet.add(token);
    const label =
      tokens.length === 1 && customLabel?.trim()
        ? customLabel.trim()
        : customLabel?.trim()
        ? `${customLabel.trim()} ${addedCount + 1}`
        : `مفتاح ${nextKeys.length + 1}`;
    nextKeys.push({
      id: `key_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      label,
      key: token,
      enabled: true,
      addedAt: Date.now(),
      usageCount: 0,
      cooldownUntil: 0,
      lastStatus: 'ready',
    });
    addedCount++;
  }

  const saved = saveAiKeyConfig({ ...config, keys: nextKeys });
  return { addedCount, duplicateCount, invalidCount, config: saved };
}

export function removeUserAiKey(id: string): AiKeyManagerConfig {
  const config = loadAiKeyConfig();
  const keys = config.keys.filter((k) => k.id !== id);
  return saveAiKeyConfig({
    ...config,
    keys,
    nextIndex: keys.length > 0 ? config.nextIndex % keys.length : 0,
  });
}

export function toggleUserAiKey(id: string): AiKeyManagerConfig {
  const config = loadAiKeyConfig();
  const keys = config.keys.map((k) =>
    k.id === id
      ? {
          ...k,
          enabled: !k.enabled,
          cooldownUntil: !k.enabled ? 0 : k.cooldownUntil,
          lastStatus: !k.enabled ? ('ready' as const) : k.lastStatus,
        }
      : k
  );
  return saveAiKeyConfig({ ...config, keys });
}

export function updateAiKeySettings(
  patch: Partial<Pick<AiKeyManagerConfig, 'rotationMode' | 'fallbackToServerKey'>>
): AiKeyManagerConfig {
  const config = loadAiKeyConfig();
  return saveAiKeyConfig({ ...config, ...patch });
}

export function resetAllKeyCooldowns(): AiKeyManagerConfig {
  const config = loadAiKeyConfig();
  const keys = config.keys.map((k) => ({
    ...k,
    cooldownUntil: 0,
    lastStatus: k.enabled ? ('ready' as const) : k.lastStatus,
    lastError: undefined,
  }));
  return saveAiKeyConfig({ ...config, keys });
}

export function markKeyTestResult(
  id: string,
  result: { valid: boolean; quotaExceeded?: boolean; message?: string }
): AiKeyManagerConfig {
  const config = loadAiKeyConfig();
  const now = Date.now();
  const keys = config.keys.map((k) => {
    if (k.id !== id) return k;
    if (result.valid) {
      return {
        ...k,
        cooldownUntil: 0,
        lastStatus: 'active' as const,
        lastError: undefined,
      };
    }
    if (result.quotaExceeded) {
      return {
        ...k,
        cooldownUntil: now + DEFAULT_COOLDOWN_MS,
        lastStatus: 'cooldown' as const,
        lastError: result.message || 'نفدت الحصة مؤقتاً',
      };
    }
    return {
      ...k,
      lastStatus: 'invalid' as const,
      lastError: result.message || 'المفتاح غير صالح',
    };
  });
  return saveAiKeyConfig({ ...config, keys });
}

function encodeBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Builds ordered headers for `/api/gemini/*` requests with smart round-robin rotation
 * and failover ordering. Keys are never put in query strings or logged.
 */
export function buildGeminiRequestContext(): {
  headers: Record<string, string>;
  sentKeyIds: string[];
} {
  const config = loadAiKeyConfig();
  const now = Date.now();

  const enabledKeys = config.keys.filter((k) => k.enabled && k.lastStatus !== 'invalid');
  if (enabledKeys.length === 0) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Key-Fallback': '1',
      },
      sentKeyIds: [],
    };
  }

  // Healthy (non-cooled-down) keys go first, cooled-down keys stay at the tail as last resort
  const healthy = enabledKeys.filter((k) => k.cooldownUntil <= now);
  const cooled = enabledKeys.filter((k) => k.cooldownUntil > now);

  let orderedHealthy = healthy;
  if (config.rotationMode === 'smart-rotate' && healthy.length > 1) {
    const start = config.nextIndex % healthy.length;
    orderedHealthy = [...healthy.slice(start), ...healthy.slice(0, start)];
  }

  const ordered = [...orderedHealthy, ...cooled];
  const sentKeyIds = ordered.map((k) => k.id);
  const encodedPayload = encodeBase64Utf8(JSON.stringify(ordered.map((k) => k.key)));

  return {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Gemini-Keys': encodedPayload,
      'X-User-Key-Fallback': config.fallbackToServerKey ? '1' : '0',
    },
    sentKeyIds,
  };
}

/**
 * Updates local key usage counters, advances smart rotation pointer,
 * and puts any quota-exhausted / invalid keys reported by the server into cooldown.
 */
export function recordGeminiResponseRotation(response: Response, sentKeyIds: string[]): void {
  if (sentKeyIds.length === 0) return;

  const usedIdxRaw = response.headers.get('X-Used-Key-Idx');
  const cooldownHeader = response.headers.get('X-Cooldown-Keys') || '';
  const invalidHeader = response.headers.get('X-Invalid-Keys') || '';

  const usedIdx = usedIdxRaw !== null && usedIdxRaw !== '' ? Number(usedIdxRaw) : -1;
  const usedId = Number.isInteger(usedIdx) && usedIdx >= 0 ? sentKeyIds[usedIdx] : null;

  const cooledIds = new Set(
    cooldownHeader
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n >= 0 && n < sentKeyIds.length)
      .map((n) => sentKeyIds[n])
  );

  const invalidIds = new Set(
    invalidHeader
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n >= 0 && n < sentKeyIds.length)
      .map((n) => sentKeyIds[n])
  );

  if (!usedId && cooledIds.size === 0 && invalidIds.size === 0) return;

  const config = loadAiKeyConfig();
  const now = Date.now();
  const keys = config.keys.map((k) => {
    if (invalidIds.has(k.id)) {
      return {
        ...k,
        lastStatus: 'invalid' as const,
        lastError: 'مرفوض من الخادم (تحقق من صلاحية المفتاح)',
      };
    }
    if (cooledIds.has(k.id)) {
      return {
        ...k,
        cooldownUntil: now + DEFAULT_COOLDOWN_MS,
        lastStatus: 'cooldown' as const,
        lastError: 'تجاوز الحصة مؤقتاً — تم التحويل للمفتاح التالي تلقائياً',
      };
    }
    if (k.id === usedId) {
      return {
        ...k,
        usageCount: k.usageCount + 1,
        cooldownUntil: 0,
        lastStatus: 'active' as const,
        lastError: undefined,
      };
    }
    return k;
  });

  const nextIndex =
    config.rotationMode === 'smart-rotate'
      ? (config.nextIndex + 1) % Math.max(1, keys.length)
      : config.nextIndex;

  saveAiKeyConfig({ ...config, keys, nextIndex });
}

export async function verifyUserGeminiKey(apiKey: string): Promise<{
  valid: boolean;
  quotaExceeded?: boolean;
  message: string;
}> {
  const { getApiUrl, isStaticHostWithoutBackend, markBackendUnavailableIfStatic, safeReadJson } =
    await import('./apiEnvironment');

  if (isStaticHostWithoutBackend()) {
    return {
      valid: false,
      message: 'فحص المفاتيح يتطلب ربط التطبيق بخادم Node.js خلفي (غير متوفر على الاستضافة الثابتة GitHub Pages).',
    };
  }

  try {
    const response = await fetch(getApiUrl('/api/gemini/verify-key'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Verify-Gemini-Key': apiKey.trim(),
      },
      body: JSON.stringify({}),
    });
    if (markBackendUnavailableIfStatic(response)) {
      return {
        valid: false,
        message: 'فحص المفاتيح يتطلب تشغيل الخادم الخلفي (Node.js).',
      };
    }
    const data = await safeReadJson<{ valid?: boolean; quotaExceeded?: boolean; message?: string }>(response);
    return {
      valid: Boolean(data?.valid),
      quotaExceeded: Boolean(data?.quotaExceeded),
      message: typeof data?.message === 'string' ? data.message : 'تعذر فحص المفتاح حالياً.',
    };
  } catch {
    return {
      valid: false,
      message: 'تعذر الاتصال بالخادم لفحص المفتاح.',
    };
  }
}
