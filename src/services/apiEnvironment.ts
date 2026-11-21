const CONFIGURED_API_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

let detectedStaticBackend = false;

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return CONFIGURED_API_BASE ? `${CONFIGURED_API_BASE}${normalizedPath}` : normalizedPath;
}

export function isStaticHostWithoutBackend(): boolean {
  if (CONFIGURED_API_BASE) return false;
  if (detectedStaticBackend) return true;
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host.endsWith('.github.io') || host === 'github.io';
}

export function markBackendUnavailableIfStatic(response: Response): boolean {
  if (response.status === 405) {
    detectedStaticBackend = true;
    return true;
  }
  return false;
}

export async function safeReadJson<T = Record<string, unknown>>(response: Response): Promise<T | null> {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
        if (response.status === 404 || response.status === 405) {
          detectedStaticBackend = true;
        }
        return null;
      }
      return JSON.parse(text) as T;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
