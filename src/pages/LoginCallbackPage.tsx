import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { loginNextStorageKey, normalizeNextPath, useAuthStore } from '../store/authStore';

export function LoginCallbackPage() {
  const navigate = useNavigate();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [error, setError] = useState('');

  useEffect(() => {
    const next = normalizeNextPath(window.sessionStorage.getItem(loginNextStorageKey));
    window.sessionStorage.removeItem(loginNextStorageKey);
    refreshUser().then((user) => {
      if (user) {
        navigate(next, { replace: true });
        return;
      }
      setError('로그인을 완료하지 못했습니다.');
    });
  }, [navigate, refreshUser]);

  return (
    <main className="grid min-h-screen place-items-center px-5 py-5">
      <section className="w-full max-w-md rounded-2xl border border-[#dfe3ee] bg-white p-8 text-center shadow-card">
        <div className="flex justify-center">
          <BrandLogo />
        </div>
        <p className="mt-5 text-xl font-black text-[#111827]">{error ? error : '로그인 상태를 확인하는 중입니다.'}</p>
        {error && (
          <button className="mt-5 text-sm font-extrabold text-[#5b45f2]" onClick={() => navigate('/login?next=/select', { replace: true })}>
            로그인으로 돌아가기
          </button>
        )}
      </section>
    </main>
  );
}
