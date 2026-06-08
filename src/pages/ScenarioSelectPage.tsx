// Modi 시나리오 선택 페이지
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { Header } from '../components/ui/Header'; // 🌟 조립
import { scenarios } from '../data/scenarios'; 
import { useAuthContext } from '../context/AuthContext';
import { useTradeContext } from '../context/TradeContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export function ScenarioSelectPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthContext();
  const { selectScenario } = useTradeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');

  useEffect(() => {
    if (!user) {
      refreshUser();
    }
  }, [refreshUser, user]);

  useEffect(() => {
    scenarios.forEach((s) => fetch(s.dataFile));
  }, []);

  return (
    <>
      {/* Header 영역 */}
      <Header />

      {/* Main 영역 */}
      <motion.main 
        className="max-w-[90rem] mx-auto mt-24 w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start border-b border-[#edf0f6] pb-8">
          <div>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-[#111827] sm:text-4xl">
              체험하실 시뮬레이션 <span className="text-[#5b45f2]">시나리오</span>를 선택해주세요
            </h1>
            <p className="mt-3 text-[20px] font-medium text-[#667085]">
              과거의 시장 상황을 직접 경험해보세요
            </p>
          </div>
        </div>

        {/* 시나리오 카드 그리드 */}
        <div className="grid gap-10 md:grid-cols-3 w-full mt-10">
          {scenarios.map((scenario) => (
            <article
              key={scenario.id}
              className="flex min-h-[25rem] flex-col overflow-hidden rounded-2xl border border-[#dfe3ee] bg-white shadow-card transition-shadow hover:shadow-xl"
            >
              <ScenarioThumb id={scenario.id} />
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-xl font-black text-[#111827]">
                  {scenario.title}
                </h2>
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
                    className="w-full font-black rounded-xl"
                    onClick={() => {
                      setSelectedTitle(scenario.title);
                      setIsLoading(true);
                      flushSync(() => selectScenario(scenario));
                      setTimeout(() => {
                        navigate('/simulation');
                      }, 1200);
                    }}
                  >
                    이 시나리오 선택
                  </Button>
                  
                  {/* 시나리오 선택 후 로딩 모달 */}
                  <Modal isOpen={isLoading} onClose={() => {}}>
                    <div className="flex flex-col items-center justify-center py-3 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5b45f2] mb-4"></div>
                      <h3 className="text-lg font-black text-[#111827]">
                        {selectedTitle}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-[#667085]">
                        시뮬레이션 환경을 구축중이에요
                      </p>
                    </div>
                  </Modal>
                </div>
              </div>
            </article>
          ))}
        </div>
      </motion.main>
    </>
  );
}

{/* 시나리오 카드 썸네일 컴포넌트 */}
function ScenarioThumb({ id }: { id: string }) {
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