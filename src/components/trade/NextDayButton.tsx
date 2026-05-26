import { motion } from 'framer-motion';
import { useTradeStore } from '../../store/tradeStore';

export function NextDayButton() {
  const nextDay = useTradeStore((state) => state.nextDay);
  const currentDay = useTradeStore((state) => state.currentDay);
  const dayProgress = useTradeStore((state) => state.dayProgress);
  const chartData = useTradeStore((state) => state.chartData);
  const isFinished = useTradeStore((state) => state.isFinished);
  const date = chartData[currentDay]?.date ?? '-';

  return (
    <motion.button
      className="w-full rounded-xl bg-[#5b45f2] px-6 py-5 text-base font-black text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={nextDay}
      disabled={isFinished}
    >
      ▶ 다음 날로 가기
      <span className="mt-1 block text-xs font-bold text-white/90">
        D+{currentDay} · {date} · {Math.round(dayProgress * 100)}%
      </span>
    </motion.button>
  );
}
