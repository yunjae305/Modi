// Modi 로그인 페이지
import { type FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { apiGet } from '../services/api';
import { normalizeNextPath, useAuthContext } from '../context/AuthContext';
import type { ProviderStatus } from '../types/auth';

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
    let active = true;
    apiGet<ProviderStatus>('/auth/providers')
      .then((status) => {
        if (active) setProviders(status);
      })
      .catch(() => {
        if (active) {
          setProviders({ providers: { email: true, kakao: false, guest: true } });
        }
      });
    return () => { active = false; };
  }, []);

  const submitCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
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

  const startKakao = () => { setError(''); loginKakao(next); };
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
    <div className="flex min-h-screen flex-col justify-between bg-[#f8f9fa] p-6 sm:p-10">

      {/* Header 영역 */}
      <header className="flex w-full max-w-[105rem] justify-between items-center mx-auto">
        <BrandLogo />
        <button 
          className="text-[17px] font-bold text-[#667085] hover:text-[#111827] transition-colors" 
          onClick={() => navigate('/')}
        >
          처음으로
        </button>
      </header>

      {/* Body 영역: 로그인/회원가입 */}
      <main className="flex flex-1 items-center justify-center w-full py-8">
        <div className="w-full max-w-xl rounded-3xl border border-[#edf0f6] bg-white p-4 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">

          <div className="mx-auto w-full max-w-xl rounded-2xl p-6">
            <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#111827] transition-all duration-200">
              {authMode === 'login' ? '로그인' : '회원가입'}
            </h1>
            <p className="mt-3 text-sm font-bold leading-6 text-[#667085]">
              로그인 또는 회원가입 후, Modi의 모든 기능을 체험하실 수 있습니다
            </p>

            <div className="mt-6 relative grid grid-cols-2 rounded-xl bg-[#f4f5f7] p-1 text-sm font-extrabold select-none">
              <div 
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[#5b45f2] rounded-lg shadow-sm transition-transform duration-300 ease-in-out ${
                  authMode === 'login' ? 'translate-x-0' : 'translate-x-full'
                }`}
              />
              
              <button
                type="button"
                className={`relative z-10 rounded-lg px-4 py-3 text-center transition-colors duration-200 ${
                  authMode === 'login' ? 'text-white' : 'text-[#667085]'
                }`}
                onClick={() => setAuthMode('login')}
              >
                로그인
              </button>
              <button
                type="button"
                className={`relative z-10 rounded-lg px-4 py-3 text-center transition-colors duration-200 ${
                  authMode === 'register' ? 'text-white' : 'text-[#667085]'
                }`}
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
                {/* 3. 요구사항: 카카오 심볼 아이콘 삽입 */}
                <Button
                  type="button"
                  variant="soft"
                  className="w-full bg-[#fee500] text-[#000000] hover:bg-[#f4da00] flex items-center justify-center gap-2 font-extrabold"
                  disabled={loading}
                  onClick={startKakao}
                >
                  <svg className="w-[18px] h-[18px] fill-[#111827]" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.553 1.706 4.8 4.315 6.046l-.805 2.953c-.092.338.113.682.457.75.105.02.21.012.31-.026l3.48-2.296A11.393 11.393 0 0 0 12 17.23c4.97 0 9-3.185 9-7.115C21 6.185 16.97 3 12 3z"/>
                  </svg>
                  Kakao로 시작하기
                </Button>
              </>
            )}

            {providers?.providers.guest && (
              <Button
                type="button"
                variant="soft"
                className="mt-3 w-full text-[#000000] flex items-center justify-center gap-2 font-extrabold"
                disabled={loading}
                onClick={startGuest}
              >
                게스트로 시작하기
              </Button>
            )}
            {error && <p className="mt-4 text-sm font-bold text-[#ff3f55]">{error}</p>}
          </div>

        </div>
      </main>

      {/* Footer 영역 */}
      <footer className="text-center text-xs font-medium text-gray-400">
        © 2026 Modi. All rights reserved.
      </footer>
    </div>
  );
}