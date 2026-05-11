import { motion } from 'framer-motion';
import { getInvestorType } from '../../utils/getInvestorType';

interface InvestorBadgeProps {
  rate: number;
}

export function InvestorBadge({ rate }: InvestorBadgeProps) {
  const result = getInvestorType(rate);

  return (
    <motion.section
      className="rounded-2xl border border-[#f3d7a5] bg-[#fff8ed] p-7 text-center shadow-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow-card">
        {result.emoji}
      </div>
      <p className="text-sm font-extrabold text-[#8a5a00]">당신의 투자 성향은...</p>
      <h2 className="mt-2 text-2xl font-black text-[#d96b00]">{result.label}</h2>
      <p className="mx-auto mt-3 max-w-xl font-medium text-[#4b5563]">{result.feedback}</p>
    </motion.section>
  );
}
