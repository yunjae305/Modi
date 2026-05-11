import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrandLogo } from '../components/ui/BrandLogo';

export function ModeSelectPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen px-5 py-5">
      <section className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-5xl content-center rounded-2xl border border-[#dfe3ee] bg-white p-6 shadow-card">
        <header className="mb-10 flex items-center justify-between">
          <BrandLogo />
          <button className="text-sm font-extrabold text-[#667085] hover:text-[#111827]" onClick={() => navigate('/')}>
            처음으로
          </button>
        </header>
        <div className="mx-auto w-full max-w-3xl text-center">
          <h1 className="text-3xl font-black tracking-[-0.03em] text-[#111827] sm:text-4xl">어떤 방식으로 시작할까요?</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-[#667085]">과거 위기장을 체험하거나, 실시간형 모의투자 계좌로 바로 연습할 수 있어요.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <ModeCard
              title="시나리오 모드"
              description="코로나 폭락장, 서브프라임 금융위기, 닷컴버블 붕괴를 블라인드로 체험해요."
              label="과거 시나리오 선택"
              icon="scenario"
              onClick={() => navigate('/select')}
            />
            <ModeCard
              title="모의투자 모드"
              description="10억 초기금으로 현재 주식 가격 기반 매수와 매도를 연습해요."
              label="모의투자 시작"
              icon="practice"
              onClick={() => navigate('/trade')}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function ModeCard({
  title,
  description,
  label,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  label: string;
  icon: 'scenario' | 'practice';
  onClick: () => void;
}) {
  return (
    <motion.button
      className="group flex min-h-[18rem] flex-col rounded-2xl border border-[#ded9ff] bg-[#f8f7ff] p-7 text-left transition hover:-translate-y-1 hover:border-[#5b45f2] hover:bg-[#f4f1ff] hover:shadow-glow"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#5b45f2] shadow-card">
        {icon === 'scenario' ? (
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
            <path d="M4 8l8-4 8 4-8 4-8-4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M7 11v4l5 3 5-3v-4" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
            <path d="M4 18V8l8-4 8 4v10l-8 4-8-4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h2 className="mt-8 text-2xl font-black text-[#111827]">{title}</h2>
      <p className="mt-3 flex-1 text-sm font-bold leading-7 text-[#667085]">{description}</p>
      <span className="mt-6 text-sm font-black text-[#5b45f2]">{label}</span>
    </motion.button>
  );
}
