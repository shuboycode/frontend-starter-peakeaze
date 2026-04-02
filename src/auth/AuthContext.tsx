import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginApi, me as meApi, signup as signupApi, type Role } from '../api/authApi';

type AuthUser = {
  id?: string;
  email?: string;
  // Keep backend response shape flexible; we'll at least extract `role`.
  [key: string]: unknown;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  reloadMe: () => Promise<void>;
};

const TOKEN_KEY = 'token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function isValidRole(value: unknown): value is Role {
  return value === 'Admin' || value === 'Accountant' || value === 'Viewer';
}

function extractRole(raw: unknown): Role | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  // Try common shapes.
  const roleTop = obj.role;
  if (isValidRole(roleTop)) return roleTop;

  const rolesArray = obj.roles;
  if (Array.isArray(rolesArray) && rolesArray.length > 0 && isValidRole(rolesArray[0])) {
    return rolesArray[0] as Role;
  }

  const user = obj.user;
  if (user && typeof user === 'object') {
    const maybeRole = (user as Record<string, unknown>).role;
    if (isValidRole(maybeRole)) return maybeRole;
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reloadMe = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setToken(null);
      setUser(null);
      setRole(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const raw = (await meApi()) as unknown;

      // Assume meApi returns the user object; store it flexibly.
      const rawObj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
      const extractedRole = extractRole(rawObj);

      // Store user either at `user` or at top-level.
      const maybeUser = rawObj.user && typeof rawObj.user === 'object' ? (rawObj.user as AuthUser) : (rawObj as AuthUser);

      setToken(currentToken);
      setUser(maybeUser);
      setRole(extractedRole);
    } catch (e) {
      clearStoredToken();
      setToken(null);
      setUser(null);
      setRole(null);
      setError(e instanceof Error ? e.message : 'Failed to load session.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token: newToken } = await loginApi({ email, password });
      setStoredToken(newToken);
      setToken(newToken);
      await reloadMe();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, newRole: Role) => {
    setLoading(true);
    setError(null);
    try {
      const { token: signupToken } = await signupApi({ email, password, role: newRole });
      if (signupToken) {
        // Backend returned token directly on signup — use it, skip extra login call
        setStoredToken(signupToken);
        setToken(signupToken);
      } else {
        // Fallback: backend didn't return token, do explicit login
        const { token: loginToken } = await loginApi({ email, password });
        setStoredToken(loginToken);
        setToken(loginToken);
      }
      await reloadMe();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setRole(null);
    setError(null);
  };

  const refresh = async () => {
    setError(null);
    const currentToken = getStoredToken();
    if (!currentToken) return;

    // Attempt to refresh and, if backend returns a new token, persist it.
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (!res.ok) {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setRole(null);
        return;
      }

      const data = (await res.json().catch(() => null)) as unknown;
      if (!data || typeof data !== 'object') return;
      const obj = data as Record<string, unknown>;

      const candidate =
        (typeof obj.token === 'string' && obj.token) ||
        (typeof obj.accessToken === 'string' && obj.accessToken) ||
        (typeof obj.access_token === 'string' && obj.access_token) ||
        (typeof obj.jwt === 'string' && obj.jwt) ||
        null;

      if (candidate) {
        setStoredToken(candidate);
        setToken(candidate);
      }
    } catch (e) {
      clearStoredToken();
      setToken(null);
      setUser(null);
      setRole(null);
      setError(e instanceof Error ? e.message : 'Failed to refresh session.');
    }
  };

  useEffect(() => {
    // Only load session if we already have a token stored.
    const currentToken = getStoredToken();
    if (!currentToken) return;
    void reloadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      role,
      loading,
      error,
      login,
      signup,
      logout,
      refresh,
      reloadMe
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, user, role, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

