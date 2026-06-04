// Modi 시나리오 선택 페이지
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrandLogo } from '../components/ui/BrandLogo';
import { scenarios } from '../data/scenarios';
import { useAuthStore } from '../store/authStore';
import { useTradeStore } from '../store/tradeStore';
import { Button } from '../components/ui/Button';

// 과거 시장 시나리오 선택 컴포넌트
export function ScenarioSelectPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const logout = useAuthStore((state) => state.logout);
  const selectScenario = useTradeStore((state) => state.selectScenario);

  useEffect(() => {
    // 헤더 사용자 표시용 세션 복구
    if (!user) {
      refreshUser();
    }
  }, [refreshUser, user]);

  useEffect(() => {
    // 시나리오 데이터 미리 다운로드 (선택 전 캐시 확보)
    scenarios.forEach((s) => fetch(s.dataFile));
  }, []);

  return (
    <main className="min-h-screen px-5 py-5">
      <section className="mx-auto max-w-6xl rounded-2xl border border-[#dfe3ee] bg-white p-6 shadow-card">
        <header className="mb-10 flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm font-extrabold text-[#111827]">{user.nickname}님</span>
                <button className="text-sm font-extrabold text-[#667085] hover:text-[#111827]" onClick={() => logout()}>
                  로그아웃
                </button>
              </>
            ) : (
              <button className="text-sm font-extrabold text-[#667085] hover:text-[#111827]" onClick={() => navigate('/login')}>
                로그인
              </button>
            )}
            <button className="text-sm font-extrabold text-[#667085] hover:text-[#111827]" onClick={() => navigate('/')}>
              처음으로
            </button>
          </div>
        </header>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-[-0.03em] text-[#111827] sm:text-4xl">실전 시뮬레이션 시나리오를 선택하세요</h1>
          <p className="mt-3 text-sm font-medium text-[#667085]">각각의 시장 상황을 직접 경험해보세요.</p>
        </div>
        <motion.div
          className="grid gap-5 md:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {scenarios.map((scenario) => (
            <motion.article
              key={scenario.id}
              className="flex min-h-[25rem] flex-col overflow-hidden rounded-2xl border border-[#dfe3ee] bg-white shadow-card"
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <ScenarioThumb id={scenario.id} />
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-xl font-black text-[#111827]">{scenario.title}</h2>
                <p className="mt-2 text-sm font-bold text-[#667085]">{scenario.subtitle}</p>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="font-bold text-[#8b95a7]">난이도</dt>
                    <dd className="font-extrabold text-[#111827]">{scenario.id === 'corona' ? '쉬움' : scenario.id === 'subprime' ? '보통' : '어려움'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="font-bold text-[#8b95a7]">기간</dt>
                    <dd className="font-extrabold text-[#111827]">{scenario.period}</dd>
                  </div>
                </dl>
                <p className="mt-4 rounded-xl bg-[#f7f8fc] p-3 text-sm font-bold leading-6 text-[#4b5563]">{scenario.lesson}</p>
                <div className="mt-auto pt-5">
                  <Button
                    className="w-full"
                    onClick={() => {
                      // flushSync로 store 업데이트 완료 후 이동 (React 18 배치 처리 방지)
                      flushSync(() => selectScenario(scenario));
                      navigate('/simulation');
                    }}
                  >
                    이 시나리오 선택
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>
    </main>
  );
}

// 시나리오 썸네일 컴포넌트
function ScenarioThumb({ id }: { id: string }) {
  // 시나리오별 색상 톤
  const tone = id === 'corona' ? 'from-[#172554] to-[#334155]' : id === 'subprime' ? 'from-[#383838] to-[#b7bbc6]' : 'from-[#475569] to-[#cbd5e1]';

  return (
    <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${tone}`}>
      <svg viewBox="0 0 320 140" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M0 96C32 70 59 92 88 58C118 22 142 63 173 43C207 21 228 46 254 22C277 2 294 19 320 8V140H0z" fill="rgba(255,255,255,0.12)" />
        <path d="M16 102L44 88L72 94L99 58L128 77L156 41L184 59L212 31L240 52L268 28L304 42" fill="none" stroke={id === 'corona' ? '#ff3f55' : '#ffffff'} strokeWidth="4" strokeLinecap="round" />
        {[42, 76, 112, 148, 188, 230, 270].map((x, index) => (
          <rect key={x} x={x} y={index % 2 ? 50 : 70} width="9" height={index % 2 ? 38 : 28} rx="3" fill={index % 2 ? '#5b45f2' : '#ff3f55'} />
        ))}
      </svg>
      <span className="absolute left-4 top-4 rounded-full bg-[#ff3f55] px-3 py-1 text-xs font-black text-white">
        {id === 'corona' ? '급락' : id === 'subprime' ? '위기' : '버블'}
      </span>
    </div>
  );
}
