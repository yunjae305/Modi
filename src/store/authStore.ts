import { create } from 'zustand';
import { apiGet, apiPost, API_BASE_URL } from '../services/api';
import type { AuthUser } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<AuthUser | null>;
  loginEmail: (email: string, password: string) => Promise<AuthUser>;
  registerEmail: (email: string, password: string, nickname: string) => Promise<AuthUser>;
  loginKakao: (next: string) => void;
  loginGuest: () => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export function normalizeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }
  if (value.startsWith('/login')) {
    return '/';
  }
  return value;
}

export const loginNextStorageKey = 'modi-login-next';

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: false,
  error: null,
  refreshUser: async () => {
    set({ loading: true, error: null });
    try {
      const user = await apiGet<AuthUser>('/auth/me');
      set({ user, loading: false, error: null });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인이 필요합니다.';
      set({ user: null, loading: false, error: message });
      return null;
    }
  },
  loginEmail: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await apiPost<AuthUser>('/auth/login', { email, password });
      set({ user, loading: false, error: null });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인을 처리하지 못했습니다.';
      set({ user: null, loading: false, error: message });
      throw new Error(message);
    }
  },
  registerEmail: async (email, password, nickname) => {
    set({ loading: true, error: null });
    try {
      const user = await apiPost<AuthUser>('/auth/register', { email, password, nickname });
      set({ user, loading: false, error: null });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입을 처리하지 못했습니다.';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  loginKakao: (next) => {
    window.sessionStorage.setItem(loginNextStorageKey, normalizeNextPath(next));
    window.location.href = `${API_BASE_URL}/auth/oauth/kakao/authorize`;
  },
  loginGuest: async () => {
    set({ loading: true, error: null });
    try {
      const user = await apiPost<AuthUser>('/auth/guest');
      set({ user, loading: false, error: null });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : '게스트 세션을 시작하지 못했습니다.';
      set({ user: null, loading: false, error: message });
      throw new Error(message);
    }
  },
  logout: async () => {
    set({ loading: true, error: null });
    await apiPost<string>('/auth/logout');
    set({ user: null, loading: false, error: null });
  },
}));
