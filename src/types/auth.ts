export type AuthProvider = 'GOOGLE' | 'KAKAO' | 'GUEST';

export interface AuthUser {
  id: string;
  provider: AuthProvider;
  nickname: string;
  email?: string | null;
  profileImage?: string | null;
  seedMoney: number;
  cash: number;
  createdAt: string;
}

export interface ProviderStatus {
  providers: {
    google: boolean;
    kakao: boolean;
    guest: boolean;
  };
}
