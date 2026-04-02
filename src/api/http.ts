type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export class ApiError extends Error {
  status: number;

  data: Json | null;

  constructor(message: string, status: number, data: Json | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const TOKEN_KEY = 'token';

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function extractTokenFromResponse(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  const candidate =
    (typeof obj.token === 'string' && obj.token) ||
    (typeof obj.accessToken === 'string' && obj.accessToken) ||
    (typeof obj.access_token === 'string' && obj.access_token) ||
    (typeof obj.jwt === 'string' && obj.jwt) ||
    null;

  return candidate;
}

async function parseJsonSafe(res: Response): Promise<Json | null> {
  try {
    return (await res.json()) as Json;
  } catch {
    return null;
  }
}

async function refreshTokenOnce(): Promise<string | null> {
  const token = getStoredToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    clearStoredToken();
    return null;
  }

  const data = await parseJsonSafe(res);
  if (!data) return null;
  const newToken = extractTokenFromResponse(data);
  if (newToken) setStoredToken(newToken);
  return newToken;
}

async function requestJson(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && typeof (data as Record<string, unknown>).message === 'string'
        ? (data as Record<string, unknown>).message as string
        : null) || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export async function authFetch<T = unknown>(
  input: RequestInfo | URL,
  init: RequestInit = {},
  retryOn401 = true
): Promise<T> {
  const token = getStoredToken();

  const headers = new Headers(init.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 && retryOn401) {
    // If token is expired, try refresh once and retry the original request.
    const newToken = await refreshTokenOnce();
    if (!newToken) throw new Error('Session expired. Please log in again.');

    const retryHeaders = new Headers(init.headers);
    retryHeaders.set('Authorization', `Bearer ${newToken}`);

    return requestJson(input, { ...init, headers: retryHeaders }) as Promise<T>;
  }

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message = (data && typeof data === 'object' && 'message' in data && typeof (data as Record<string, unknown>).message === 'string'
      ? (data as Record<string, unknown>).message as string
      : null) || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

