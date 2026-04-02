import { authFetch, API_BASE } from './http';

export type Role = 'Admin' | 'Accountant' | 'Viewer';

export async function signup(payload: { email: string; password: string; role: Role }) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let message = `Signup failed (${res.status})`;
    try {
      const data = await res.json();
      if (data && typeof data === 'object' && 'message' in data && typeof (data as Record<string, unknown>).message === 'string') {
        message = (data as Record<string, unknown>).message as string;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  // Spec returns { token, user } on 201
  try {
    const data = await res.json() as Record<string, unknown>;
    const token = typeof data.token === 'string' ? data.token : null;
    return { token };
  } catch {
    return { token: null };
  }
}

export async function login(payload: { email: string; password: string }) {
  const data = await authFetch<{ token?: string }>(
    `${API_BASE}/api/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // authFetch attaches Authorization if a token already exists, but for login it's harmless.
      body: JSON.stringify(payload)
    },
    false
  );

  const { token } = data;
  if (!token) throw new Error('Login failed: token missing.');
  return { token };
}

export async function me() {
  return authFetch<unknown>(`${API_BASE}/api/auth/me`, { method: 'GET' });
}

