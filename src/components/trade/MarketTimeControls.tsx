// Modi 시장 시간 제어 컴포넌트
import { useEffect } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import type { MarketSpeed } from '../../types';

const speeds: { value: MarketSpeed; label: string }[] = [
  { value: 1, label: '1배속' },
  { value: 2, label: '2배속' },
  { value: 4, label: '4배속' },
];

// 시장 재생과 배속 제어 컴포넌트
export function MarketTimeControls() {
  const { isPlaying, isFinished, marketSpeed, dayProgress, togglePlaying, setMarketSpeed, tick } = useTradeContext();

  useEffect(() => {
    // 재생 중 interval tick
    if (!isPlaying || isFinished) {
      return;
    }
    const timer = window.setInterval(() => {
      tick(1000);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isFinished, isPlaying, tick]);

  return (
    <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-[#111827]">시장 시간</h2>
        <span className="text-xs font-extrabold text-[#667085]">{Math.round(dayProgress * 100)}%</span>
      </div>
      <button
        className="w-full rounded-xl bg-[#111827] px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={togglePlaying}
        disabled={isFinished}
      >
        {isPlaying ? '일시정지' : '재생'}
      </button>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {speeds.map((speed) => (
          <button
            key={speed.value}
            className={`rounded-xl border px-3 py-3 text-sm font-black ${marketSpeed === speed.value ? 'border-[#5b45f2] bg-[#f8f7ff] text-[#5b45f2]' : 'border-[#dfe3ee] text-[#667085]'}`}
            onClick={() => setMarketSpeed(speed.value)}
          >
            {speed.label}
          </button>
        ))}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf0f6]">
        <span className="block h-full rounded-full bg-[#5b45f2]" style={{ width: `${Math.round(dayProgress * 100)}%` }} />
      </div>
    </section>
  );
}
