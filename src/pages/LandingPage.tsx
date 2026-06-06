// Modi 랜딩 페이지
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { HeroIllustration } from '../components/ui/HeroIllustration';
import { Modal } from '../components/ui/Modal';
import { useAuthContext } from '../context/AuthContext';

// 서비스 첫 화면 컴포넌트
export function LandingPage() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 랜딩 세션 복구
    if (!user) {
      refreshUser();
    }
  }, [refreshUser, user]);

  return (
    <>
        {/* 헤더 영역 */}
        <header className="flex items-center justify-between pt-8 max-w-[90rem] mx-auto">
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
            {/* 로그인별 헤더 액션 */}
            {user ? (
              <>
                <span className="hidden text-[15px] font-bold text-[#111827] sm:block">{user.nickname}님</span>
                <Button variant="primary" className="hidden px-4 py-2 text-xs sm:block" onClick={() => logout()}>
                  로그아웃
                </Button>
              </>
            ) : (
              <Button variant="ghost" className="hidden px-7 py-2  sm:block" onClick={() => navigate('/login')}>
                로그인
              </Button>
            )}
          </div>
        </header>

        {/* Body 콘텐츠 영역 */}
        <div className="grid min-h-[585px] mx-auto max-w-[90rem] items-center justify-between lg:grid-cols-[1fr_1.1fr]">
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
              <Button className="px-8 text-[15px]" onClick={() => setIsOpen(true)}>
                지금 체험해보기
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

        {/* Footer 영역 - 서비스 소개 */}
        <div id="service" className="grid gap-5 border-t border-[#edf0f6] pt-10 md:grid-cols-3 max-w-[90rem] mx-auto">
          {[
            ['실제 과거 데이터 기반', '공포와 회복 데이터로 현실감 있는 경험'],
            ['리스크 없는 학습', '가상 자금으로 매매하며 투자 연습'],
            ['실전 감각 향상', '위기 대응 능력과 판단력 강화'],
          ].map(([title, desc]) => (
            <article key={title} className="rounded-2xl bg-[#fbfbfe] p-6 text-center transition-all hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 duration-200">
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="text-center">
          <div className="mb-5 flex justify-end">
            <button className="text-xl text-[#7b8496]" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <h2 className="text-2xl font-black text-[#111827]">주식이 처음이신가요? </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-[#667085]">맞춤형 경험을 위해 선택해주세요.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <button
              className="rounded-2xl bg-[#f7f6ff] p-6 text-left transition hover:bg-[#f0edff]"
              onClick={() => navigate('/tutorial')}
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-white text-[#5b45f2] shadow-card">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                  <path d="M4 8l8-4 8 4-8 4-8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M7 11v4l5 3 5-3v-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <strong className="text-lg text-[#111827]">예, 처음이에요!</strong>
              <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">초보자를 위한 튜토리얼로 기초부터 배워요</p>
            </button>
            <button
              className="rounded-2xl bg-[#f7f6ff] p-6 text-left transition hover:bg-[#f0edff]"
              onClick={() => navigate('/select')}
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-white text-[#5b45f2] shadow-card">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                  <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <strong className="text-lg text-[#111827]">경험이 있어요!</strong>
              <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">과거 시장 시나리오를 선택해 바로 투자해요</p>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
