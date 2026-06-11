//Modi 시뮬레이션 결과 평가 뱃지 컴포넌트
import { motion } from 'framer-motion';
import { getInvestorType } from '../../utils/getInvestorType';

interface InvestorBadgeProps {
  rate: number;
}

export function InvestorBadge({ rate }: InvestorBadgeProps) {
  const result = getInvestorType(rate);

  return (
    <motion.section

      className="w-full rounded-3xl border border-[#f3d7a5] bg-[#fff8ed] p-6 shadow-sm flex items-center gap-6 text-left"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-5xl shadow-sm">
        {result.emoji}
      </div>

      <div className="flex flex-col min-w-0">
        <h2 className="text-3xl font-black tracking-tight text-[#d96b00]">
          {result.label}
        </h2>
        <p className="mt-2 text-sm font-bold leading-relaxed text-[#4b5563]">
          {result.feedback}
        </p>
      </div>
    </motion.section>
  );
}