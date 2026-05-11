import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTradeStore } from '../../store/tradeStore';
import { formatCount } from '../../utils/format';
import { Button } from '../ui/Button';

export function TradePanel() {
  const buy = useTradeStore((state) => state.buy);
  const sell = useTradeStore((state) => state.sell);
  const cash = useTradeStore((state) => state.cash);
  const holdings = useTradeStore((state) => state.holdings);
  const currentPrice = useTradeStore((state) => state.currentPrice());
  const [buyQty, setBuyQty] = useState(10);
  const [sellQty, setSellQty] = useState(10);
  const [flash, setFlash] = useState<'buy' | 'sell' | null>(null);
  const maxBuyQty = currentPrice > 0 ? Math.floor(cash / currentPrice) : 0;

  const showFlash = (type: 'buy' | 'sell') => {
    setFlash(type);
    window.setTimeout(() => setFlash(null), 320);
  };

  const handleBuy = () => {
    buy(buyQty);
    showFlash('buy');
  };

  const handleSell = () => {
    sell(sellQty);
    showFlash('sell');
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
      <AnimatePresence>
        {flash && (
          <motion.div
            className={`absolute inset-0 ${flash === 'buy' ? 'bg-[#5b45f2]/10' : 'bg-[#ff3f55]/10'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#111827]">주문</h2>
          <span className="text-xs font-extrabold text-[#5b45f2]">시장가</span>
        </div>
        <div className="space-y-5">
          <div className="rounded-xl border border-[#ded9ff] bg-[#f8f7ff] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-extrabold text-[#5b45f2]">매수</p>
              <button className="text-xs font-extrabold text-[#5b45f2]" onClick={() => setBuyQty(maxBuyQty)}>
                최대 {formatCount(maxBuyQty)}
              </button>
            </div>
            <input
              className="mb-3 w-full rounded-xl border border-[#dfe3ee] bg-white px-4 py-3 text-center font-extrabold text-[#111827] outline-none focus:border-[#5b45f2]"
              type="number"
              min={1}
              value={buyQty}
              onChange={(event) => setBuyQty(Number(event.target.value))}
            />
            <Button className="w-full" onClick={handleBuy} disabled={maxBuyQty <= 0}>
              매수하기
            </Button>
          </div>
          <div className="rounded-xl border border-[#ffd6dc] bg-[#fff7f8] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-extrabold text-[#ff3f55]">매도</p>
              <button className="text-xs font-extrabold text-[#ff3f55]" onClick={() => setSellQty(holdings)}>
                전량 {formatCount(holdings)}
              </button>
            </div>
            <input
              className="mb-3 w-full rounded-xl border border-[#dfe3ee] bg-white px-4 py-3 text-center font-extrabold text-[#111827] outline-none focus:border-[#ff3f55] disabled:opacity-50"
              type="number"
              min={1}
              value={sellQty}
              disabled={holdings === 0}
              onChange={(event) => setSellQty(Number(event.target.value))}
            />
            <Button className="w-full" variant="danger" onClick={handleSell} disabled={holdings === 0}>
              매도하기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
