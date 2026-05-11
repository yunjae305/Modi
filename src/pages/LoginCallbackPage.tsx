import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { useAuthStore } from '../store/authStore';

export function LoginCallbackPage() {
  const navigate = useNavigate();
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    refreshUser().then((user) => {
      navigate(user ? '/trade' : '/login', { replace: true });
    });
  }, [navigate, refreshUser]);

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="rounded-2xl border border-[#dfe3ee] bg-white p-8 text-center shadow-card">
        <div className="flex justify-center">
          <BrandLogo />
        </div>
        <p className="mt-5 text-xl font-black text-[#111827]">로그인 상태를 확인하는 중입니다.</p>
        <p className="mt-2 text-sm font-bold text-[#667085]">잠시만 기다려주세요.</p>
      </section>
    </main>
  );
}
