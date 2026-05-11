import { getCachedApiUrl, loadApiUrl, secureStorage } from './config';
import type { ApiError, AuthSession, User } from '@/types/api';

const REFRESH_COOKIE_NAME = 'verseny_rt';
const REFRESH_TOKEN_KEY = 'verseny.refreshToken';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let onUnauthorized: (() => void) | null = null;
let onTokenChange: ((s: AuthSession | null) => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export async function loadRefreshToken(): Promise<string | null> {
  if (refreshToken) return refreshToken;
  refreshToken = await secureStorage.get(REFRESH_TOKEN_KEY);
  return refreshToken;
}

export async function setRefreshToken(token: string | null) {
  refreshToken = token;
  if (token) {
    await secureStorage.set(REFRESH_TOKEN_KEY, token);
  } else {
    await secureStorage.del(REFRESH_TOKEN_KEY);
  }
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function registerUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export function registerTokenChangeHandler(fn: (s: AuthSession | null) => void) {
  onTokenChange = fn;
}

/** Parse the Set-Cookie header(s) for our refresh cookie. */
function extractRefreshCookie(headers: Headers): string | null {
  // fetch's Headers on RN concatenates set-cookie values with comma — but commas
  // also occur in cookie attributes (Expires). Use a getter that returns the
  // joined string and parse defensively.
  const raw = (headers.get('set-cookie') || '') as string;
  if (!raw) return null;
  // Split into individual cookies. A standalone comma inside an Expires date
  // looks like ", Wed, 12 Mar..." (preceded by a weekday). The simplest heuristic:
  // split on commas that are followed by " <token>=" — start of a new cookie.
  const parts = raw.split(/,(?=\s*[a-zA-Z0-9_\-]+=)/);
  for (const part of parts) {
    const match = part.match(new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE_NAME}=([^;]+)`));
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

async function getBaseUrl(): Promise<string> {
  let base = getCachedApiUrl();
  if (!base) base = await loadApiUrl();
  if (!base) throw new Error('API_URL_NOT_CONFIGURED');
  return base;
}

type RequestOptions = RequestInit & {
  json?: any;
  query?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
};

async function rawFetch(path: string, opts: RequestOptions = {}): Promise<Response> {
  const base = await getBaseUrl();
  const url = new URL(`${base}/api/v1${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };

  let body = opts.body;
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  }

  if (!opts.skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Send refresh cookie alongside requests so the API treats it like a normal session.
  if (refreshToken) {
    headers['Cookie'] = `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`;
  }

  return fetch(url.toString(), { ...opts, headers, body });
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  const res = await rawFetch('/auth/refresh', { method: 'POST', skipAuth: true });
  if (!res.ok) {
    return false;
  }
  const data = (await res.json()) as AuthSession;
  accessToken = data.accessToken;
  const newRt = extractRefreshCookie(res.headers);
  if (newRt) await setRefreshToken(newRt);
  onTokenChange?.(data);
  return true;
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: any;
  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function api<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res = await rawFetch(path, opts);

  if (res.status === 401 && !opts.skipAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await rawFetch(path, opts);
    } else {
      onUnauthorized?.();
      throw new ApiClientError(401, 'UNAUTHENTICATED', 'Session expired');
    }
  }

  if (!res.ok) {
    let body: ApiError | null = null;
    try {
      body = (await res.json()) as ApiError;
    } catch {
      /* ignore */
    }
    const code = body?.error?.code || 'INTERNAL';
    const message = body?.error?.message || `HTTP ${res.status}`;
    throw new ApiClientError(res.status, code, message, body?.error?.details);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

/** Login wraps api() so we can capture the Set-Cookie refresh token. */
export async function loginRequest(email: string, password: string): Promise<AuthSession> {
  const res = await rawFetch('/auth/login', {
    method: 'POST',
    json: { email, password },
    skipAuth: true,
  });
  if (!res.ok) {
    let body: ApiError | null = null;
    try { body = await res.json(); } catch { /* ignore */ }
    throw new ApiClientError(res.status, body?.error?.code || 'INTERNAL', body?.error?.message || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as AuthSession;
  accessToken = data.accessToken;
  const rt = extractRefreshCookie(res.headers);
  if (rt) await setRefreshToken(rt);
  return data;
}

export async function acceptInviteRequest(payload: { token: string; name: string; password: string; locale: 'HU' | 'EN' }): Promise<AuthSession> {
  const res = await rawFetch('/auth/accept-invite', { method: 'POST', json: payload, skipAuth: true });
  if (!res.ok) {
    let body: ApiError | null = null;
    try { body = await res.json(); } catch { /* ignore */ }
    throw new ApiClientError(res.status, body?.error?.code || 'INTERNAL', body?.error?.message || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as AuthSession;
  accessToken = data.accessToken;
  const rt = extractRefreshCookie(res.headers);
  if (rt) await setRefreshToken(rt);
  return data;
}

export async function logoutRequest(): Promise<void> {
  try {
    await rawFetch('/auth/logout', { method: 'POST' });
  } catch {
    /* even if request fails we still want to drop local state */
  }
  accessToken = null;
  await setRefreshToken(null);
}

/** Used by initial app load — restores access token from stored refresh token. */
export async function restoreSession(): Promise<AuthSession | null> {
  const rt = await loadRefreshToken();
  if (!rt) return null;
  const refreshed = await tryRefresh();
  if (!refreshed) {
    await setRefreshToken(null);
    return null;
  }
  // tryRefresh notifies via onTokenChange, but also fetch /me for the latest profile.
  try {
    const me = await api<User>('/me');
    return { accessToken: accessToken!, user: me };
  } catch {
    return null;
  }
}
