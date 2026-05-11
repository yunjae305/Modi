import { motion } from 'framer-motion';
import { useTradeStore } from '../../store/tradeStore';
import { formatCount, formatKRW, formatRate } from '../../utils/format';

export function AssetStatus() {
  const cash = useTradeStore((state) => state.cash);
  const holdings = useTradeStore((state) => state.holdings);
  const avgPrice = useTradeStore((state) => state.avgPrice);
  const profitRate = useTradeStore((state) => state.profitRate());
  const currentPrice = useTradeStore((state) => state.currentPrice());
  const portfolioValue = useTradeStore((state) => state.portfolioValue());
  const rateColor = profitRate >= 0 ? 'text-[#16a34a]' : 'text-[#ff3f55]';

  return (
    <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-black text-[#111827]">내 자산 현황</h2>
        <span className="rounded-full bg-[#f3f4f8] px-3 py-1 text-xs font-extrabold text-[#5b45f2]">
          현재가 {formatKRW(currentPrice)}
        </span>
      </div>
      <div className="grid gap-3">
        <div className="rounded-xl bg-[#f7f8fc] p-4">
          <p className="text-xs font-bold text-[#7b8496]">총 평가금액</p>
          <p className="mt-1 text-2xl font-black text-[#111827]">{formatKRW(portfolioValue)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#f7f8fc] p-4">
            <p className="text-xs font-bold text-[#7b8496]">현금</p>
            <p className="mt-1 font-extrabold text-[#111827]">{formatKRW(cash)}</p>
          </div>
          <div className="rounded-xl bg-[#f7f8fc] p-4">
            <p className="text-xs font-bold text-[#7b8496]">보유 수량</p>
            <p className="mt-1 font-extrabold text-[#111827]">{formatCount(holdings)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#f7f8fc] p-4">
            <p className="text-xs font-bold text-[#7b8496]">평균가</p>
            <p className="mt-1 font-extrabold text-[#111827]">{holdings === 0 ? '-' : formatKRW(avgPrice)}</p>
          </div>
          <div className="rounded-xl bg-[#f7f8fc] p-4">
            <p className="text-xs font-bold text-[#7b8496]">수익률</p>
            <motion.p
              key={formatRate(profitRate)}
              className={`mt-1 font-black ${rateColor}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {formatRate(profitRate)}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
