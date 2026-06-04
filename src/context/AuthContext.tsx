import { createContext, useCallback, useContext, useState } from 'react';
import type { AuthUser } from '../types/auth';
import { apiGet, apiPost, API_BASE_URL } from '../services/api';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  refreshUser: () => Promise<AuthUser | null>;
  loginEmail: (email: string, password: string) => Promise<AuthUser>;
  registerEmail: (email: string, password: string, nickname: string) => Promise<AuthUser>;
  loginKakao: (next: string) => void;
  loginGuest: () => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export function normalizeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.startsWith('/login')) return '/';
  return value;
}

export const loginNextStorageKey = 'modi-login-next';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await apiGet<AuthUser>('/auth/me');
      setUser(u);
      setLoading(false);
      return u;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '로그인이 필요합니다.';
      setUser(null);
      setLoading(false);
      setError(msg);
      return null;
    }
  }, []);

  const loginEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await apiPost<AuthUser>('/auth/login', { email, password });
      setUser(u);
      setLoading(false);
      return u;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '로그인을 처리하지 못했습니다.';
      setUser(null);
      setLoading(false);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const registerEmail = useCallback(async (email: string, password: string, nickname: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await apiPost<AuthUser>('/auth/register', { email, password, nickname });
      setUser(u);
      setLoading(false);
      return u;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '회원가입을 처리하지 못했습니다.';
      setLoading(false);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const loginKakao = useCallback((next: string) => {
    window.sessionStorage.setItem(loginNextStorageKey, normalizeNextPath(next));
    window.location.href = `${API_BASE_URL}/auth/oauth/kakao/authorize`;
  }, []);

  const loginGuest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await apiPost<AuthUser>('/auth/guest');
      setUser(u);
      setLoading(false);
      return u;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '게스트 세션을 시작하지 못했습니다.';
      setUser(null);
      setLoading(false);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await apiPost<string>('/auth/logout');
    setUser(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshUser, loginEmail, registerEmail, loginKakao, loginGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
