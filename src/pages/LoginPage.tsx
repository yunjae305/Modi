// Modi 로그인 페이지
import { type FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { apiGet } from '../services/api';
import { normalizeNextPath, useAuthContext } from '../context/AuthContext';
import type { ProviderStatus } from '../types/auth';

// 이메일, Kakao, 게스트 로그인 컴포넌트
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginEmail, registerEmail, loginKakao, loginGuest, loading } = useAuthContext();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<ProviderStatus | null>(null);
  const next = normalizeNextPath(new URLSearchParams(location.search).get('next'));

  useEffect(() => {
    // provider 상태 조회
    let active = true;
    apiGet<ProviderStatus>('/auth/providers')
      .then((status) => {
        if (active) {
          setProviders(status);
        }
      })
      .catch(() => {
        if (active) {
          // provider 조회 실패 fallback
          setProviders({ providers: { email: true, kakao: false, guest: true } });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // 이메일 인증 submit 함수
  const submitCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      // authMode 기반 login/register 분기
      if (authMode === 'login') {
        await loginEmail(email, password);
      } else {
        await registerEmail(email, password, nickname);
      }
      navigate(next, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : '요청을 처리하지 못했습니다.');
    }
  };

  // Kakao 로그인 시작 함수
  const startKakao = () => {
    setError('');
    // 외부 OAuth 페이지 이동
    loginKakao(next);
  };

  // 게스트 로그인 시작 함수
  const startGuest = async () => {
    setError('');
    try {
      await loginGuest();
      navigate(next, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : '게스트 세션을 시작하지 못했습니다.');
    }
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
          <p className="text-sm font-extrabold text-[#5b45f2]">로그인</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#111827]">시나리오 투자 계정으로 시작하세요</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-[#667085]">
            {providers?.providers.kakao ? '아이디와 비밀번호로 로그인하거나 Kakao, 게스트 세션으로 빠르게 시작할 수 있습니다.' : '아이디와 비밀번호 또는 게스트 세션으로 시작할 수 있습니다.'}
          </p>
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-white p-1 text-sm font-extrabold">
            <button
              type="button"
              className={`rounded-lg px-4 py-3 ${authMode === 'login' ? 'bg-[#5b45f2] text-white shadow-glow' : 'text-[#667085]'}`}
              onClick={() => setAuthMode('login')}
            >
              로그인
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-3 ${authMode === 'register' ? 'bg-[#5b45f2] text-white shadow-glow' : 'text-[#667085]'}`}
              onClick={() => setAuthMode('register')}
            >
              회원가입
            </button>
          </div>
          <form className="mt-5 grid gap-3" onSubmit={submitCredentials}>
            {authMode === 'register' && (
              <input
                className="w-full rounded-xl border border-[#dfe3ee] bg-white px-4 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#5b45f2]"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="닉네임"
              />
            )}
            <input
              className="w-full rounded-xl border border-[#dfe3ee] bg-white px-4 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#5b45f2]"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="아이디(이메일)"
            />
            <input
              className="w-full rounded-xl border border-[#dfe3ee] bg-white px-4 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#5b45f2]"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호"
            />
            <Button className="w-full" disabled={loading}>
              {authMode === 'login' ? '아이디로 로그인' : '회원가입하고 시작'}
            </Button>
          </form>
          {providers?.providers.kakao && (
            <>
              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-[#dfe3ee]" />
                <span className="text-xs font-extrabold text-[#8b95a7]">또는</span>
                <span className="h-px flex-1 bg-[#dfe3ee]" />
              </div>
              <Button
                type="button"
                variant="soft"
                className="w-full bg-[#fee500] text-[#111827] hover:bg-[#f4da00]"
                disabled={loading}
                onClick={startKakao}
              >
                Kakao로 시작하기
              </Button>
            </>
          )}
          {providers?.providers.guest && (
            <Button
              type="button"
              variant="soft"
              className="mt-3 w-full"
              disabled={loading}
              onClick={startGuest}
            >
              게스트로 시작하기
            </Button>
          )}
          {error && <p className="mt-4 text-sm font-bold text-[#ff3f55]">{error}</p>}
        </div>
      </section>
    </main>
  );
}
