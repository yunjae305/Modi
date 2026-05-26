export type AuthProvider = 'EMAIL' | 'KAKAO';

export interface AuthUser {
  id: string;
  provider: AuthProvider;
  nickname: string;
  email: string | null;
  profileImage: string | null;
  seedMoney: number;
  cash: number;
  createdAt: string;
}

export interface ProviderStatus {
  providers: {
    email: boolean;
    kakao: boolean;
  };
}
