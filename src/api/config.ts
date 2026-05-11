import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL_KEY = 'verseny.apiUrl';

// SecureStore isn't available on web; fall back to localStorage there.
const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* ignore */
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async del(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const secureStorage = storage;

let cachedApiUrl: string | null = null;

export async function loadApiUrl(): Promise<string | null> {
  if (cachedApiUrl) return cachedApiUrl;
  const v = await storage.get(API_URL_KEY);
  if (v) cachedApiUrl = v;
  return v;
}

export async function saveApiUrl(url: string): Promise<void> {
  const trimmed = url.trim().replace(/\/+$/, '');
  cachedApiUrl = trimmed;
  await storage.set(API_URL_KEY, trimmed);
}

export async function clearApiUrl(): Promise<void> {
  cachedApiUrl = null;
  await storage.del(API_URL_KEY);
}

export function getCachedApiUrl(): string | null {
  return cachedApiUrl;
}

// Quick reachability probe — hits /healthz with a short timeout.
export async function probeApiUrl(url: string, timeoutMs = 5000): Promise<{ ok: boolean; error?: string }> {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(trimmed)) {
    return { ok: false, error: 'URL must start with http:// or https://' };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${trimmed}/healthz`, { signal: controller.signal });
    if (!res.ok) return { ok: false, error: `Server returned ${res.status}` };
    const data = await res.json().catch(() => null);
    if (!data || data.ok !== true) return { ok: false, error: 'Unexpected response from /healthz' };
    return { ok: true };
  } catch (e: any) {
    if (e.name === 'AbortError') return { ok: false, error: 'Connection timed out' };
    return { ok: false, error: e.message || 'Network error' };
  } finally {
    clearTimeout(timeout);
  }
}
