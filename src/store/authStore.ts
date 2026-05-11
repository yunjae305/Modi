import { create } from 'zustand';
import type { AuthUser } from '../types/auth';
import { apiGet, apiPost } from '../services/api';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<AuthUser | null>;
  loginGuest: () => Promise<AuthUser>;
  logout: () => Promise<void>;
}

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
      set({ user: null, loading: false, error: error instanceof Error ? error.message : '로그인이 필요합니다.' });
      return null;
    }
  },
  loginGuest: async () => {
    set({ loading: true, error: null });
    try {
      const user = await apiPost<AuthUser>('/auth/guest');
      set({ user, loading: false, error: null });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : '게스트 로그인을 처리하지 못했습니다.';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  logout: async () => {
    await apiPost<string>('/auth/logout');
    set({ user: null, loading: false, error: null });
  },
}));
