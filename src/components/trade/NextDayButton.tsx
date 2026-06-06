// Modi 다음 구간 버튼 컴포넌트
import { motion } from 'framer-motion';
import { useTradeContext } from '../../context/TradeContext';

// 수동 구간 이동 버튼 컴포넌트
export function NextDayButton() {
  const { nextDay, currentDay, dayProgress, chartData, isFinished } = useTradeContext();
  // 버튼 보조 날짜 표시
  const date = chartData[currentDay]?.date ?? '-';

  return (
    <motion.button
      className="w-full rounded-xl bg-[#5b45f2] px-6 py-4 text-base font-black text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={nextDay}
      disabled={isFinished}
    >
      ▶ 다음 구간으로 가기
      <span className="mt-1 block text-xs font-bold text-white/90">
        {date} · {Math.round(dayProgress * 100)}%
      </span>
    </motion.button>
  );
}
