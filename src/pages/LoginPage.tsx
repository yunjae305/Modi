import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { API_ORIGIN, apiGet } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { ProviderStatus } from '../types/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginGuest = useAuthStore((state) => state.loginGuest);
  const loading = useAuthStore((state) => state.loading);
  const [providers, setProviders] = useState<ProviderStatus['providers'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const next = new URLSearchParams(location.search).get('next') ?? '/trade';

  useEffect(() => {
    apiGet<ProviderStatus>('/auth/providers')
      .then((data) => setProviders(data.providers))
      .catch((error: Error) => setError(error.message));
  }, []);

  const startOAuth = (provider: 'google' | 'kakao') => {
    window.location.href = `${API_ORIGIN}/api/auth/oauth/${provider}/authorize`;
  };

  const startGuest = async () => {
    await loginGuest();
    navigate(next);
  };

  return (
    <main className="min-h-screen px-5 py-5">
      <section className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-5xl content-center rounded-2xl border border-[#dfe3ee] bg-white p-6 shadow-card">
        <header className="mb-8 flex items-center justify-between">
          <BrandLogo />
          <button className="text-sm font-extrabold text-[#667085] hover:text-[#111827]" onClick={() => navigate('/')}>
            처음으로
          </button>
        </header>
        <div className="mx-auto w-full max-w-xl rounded-2xl border border-[#edf0f6] bg-[#fbfbfe] p-6">
          <p className="text-sm font-extrabold text-[#5b45f2]">소셜 로그인</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#111827]">10억 모의투자를 시작하세요</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-[#667085]">
            로그인하면 포트폴리오, 매수·매도 내역, 랭킹이 서버에 저장됩니다.
          </p>
          <div className="mt-6 grid gap-3">
            <Button
              variant="ghost"
              className="w-full"
              disabled={providers?.google === false}
              onClick={() => startOAuth('google')}
            >
              Google로 시작하기
            </Button>
            <Button
              variant="soft"
              className="w-full bg-[#fee500] text-[#111827] hover:bg-[#f4da00]"
              disabled={providers?.kakao === false}
              onClick={() => startOAuth('kakao')}
            >
              Kakao로 시작하기
            </Button>
            <Button className="w-full" disabled={loading} onClick={startGuest}>
              게스트로 10억 모의투자 체험
            </Button>
          </div>
          {providers && (!providers.google || !providers.kakao) && (
            <p className="mt-4 rounded-xl bg-white p-4 text-xs font-bold leading-5 text-[#667085]">
              Google/Kakao 키가 아직 없으면 버튼이 비활성화됩니다. 서버 환경변수에 Client ID와 Secret을 넣으면 실제 OAuth 버튼이 열립니다.
            </p>
          )}
          {error && <p className="mt-4 text-sm font-bold text-[#ff3f55]">{error}</p>}
        </div>
      </section>
    </main>
  );
}
