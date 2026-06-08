// Modi 랜딩 페이지
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { HeroIllustration } from '../components/ui/HeroIllustration';
import { ModeSelectModal } from '../components/ui/ModeSelectModal'; // 🌟 아까 만든 공통 모드선택 모달 부품 임포트
import { useAuthContext } from '../context/AuthContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      refreshUser();
    }
  }, [refreshUser, user]);

  return (
    <>
        {/* 헤더 영역 */}
        <header className="flex items-center justify-between pt-8 max-w-[90rem] mx-auto w-full">
          <BrandLogo />
          <nav className="hidden items-center gap-[6rem] text-[15px] font-bold text-[#111827] md:flex">
            <button className="hover:text-[#5b45f2] transition-colors duration-500 ease-in-out" onClick={() => navigate('/select')}>
              시나리오 투자
            </button>
            <button className="hover:text-[#5b45f2] transition-colors duration-500 ease-in-out" onClick={() => navigate('/tutorial')}>
              학습 가이드
            </button>
            <button className="hover:text-[#5b45f2] transition-colors duration-500 ease-in-out" onClick={() => navigate('/trade')}>
              순위 대시보드
            </button>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden text-[15px] font-bold text-[#111827] sm:block">{user.nickname}님</span>
                <Button variant="primary" className="hidden px-4 py-2 text-xs sm:block font-bold rounded-xl shadow-sm" onClick={() => logout()}>
                  로그아웃
                </Button>
              </>
            ) : (
              <Button variant="ghost" className="hidden px-7 py-2 sm:block" onClick={() => navigate('/login')}>
                로그인
              </Button>
            )}
          </div>
        </header>

        {/* Body 콘텐츠 영역 */}
        <div className="grid min-h-[585px] mx-auto max-w-[90rem] items-center justify-between lg:grid-cols-[1fr_1.1fr] w-full">
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <h1 className="text-4xl font-black leading-[1.25] tracking-[-0.04em] text-[#111827] sm:text-6xl sm:leading-[1.15]">
              과거의 시장에서 배우는
              <br className="hidden sm:inline" />
              <span className="block sm:inline"> 더 나은 <span className="text-[#5b45f2]">투자</span>의 선택</span>
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-8 text-[#667085]">
              실제 시장 데이터를 기반으로 한 시나리오 투자로 위기 속에서 기회를 찾는 능력을 키워보세요.
            </p>
            <div className="mt-8">
              <Button className="px-8 text-[15px] font-black rounded-full" onClick={() => setIsOpen(true)}>
                모드 선택
              </Button>
            </div>
          </motion.section>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.55 }}
          >
            <HeroIllustration />
          </motion.div>
        </div>

        {/* Main2 영역 */}
        <div id="service" className="grid gap-5 border-[#edf0f6] pb-16 md:grid-cols-3 max-w-[90rem] mx-auto w-full">
          {[
            ['실제 과거 데이터 기반', '공포와 회복 데이터로 현실감 있는 경험'],
            ['리스크 없는 학습', '가상 자금으로 매매하며 투자 연습'],
            ['실전 감각 향상', '위기 대응 능력과 판단력 강화'],
          ].map(([title, desc]) => (
            <article key={title} className="rounded-3xl bg-[#fbfbfe] p-6 text-center transition-all border border-[#edf0f6] hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 duration-200">
              <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[#f0edff] text-[#5b45f2] ">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-black text-[#111827]">{title}</h2>
              <p className="mt-2 text-sm font-medium text-[#667085]">{desc}</p>
            </article>
          ))}
        </div>

        {/* Footer 영역 */}
        <footer className="border-t border-[#edf0f6] pt-8 pb-16 max-w-[90rem] mx-auto w-full flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between text-xs font-semibold text-[#8b95a7]">
          <div>
            <p>© 2026 Modi. All rights reserved.</p>
            <p className="mt-1 text-[11px] text-[#a3aab8] font-medium">크로스플랫폼프로그래밍2 기말 프로젝트 — 과거 주식시장 빅데이터를 활용한 개인 투자 리스크 관리 학습 플랫폼</p>
          </div>
        </footer>

      {/* 모드 선택 모달 */}
      <ModeSelectModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}