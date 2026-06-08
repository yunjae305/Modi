// Modi 주문 패널 컴포넌트
import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTradeContext } from '../../context/TradeContext';
import { formatCount } from '../../utils/format';
import { Button } from '../ui/Button';

// 시나리오 매수매도 주문 컴포넌트
export function TradePanel() {
  const { buy, sell, cash, holdings, selectedStock, currentPrice } = useTradeContext();
  const [buyQty, setBuyQty] = useState(10);
  const [sellQty, setSellQty] = useState(10);
  const [flash, setFlash] = useState<'buy' | 'sell' | null>(null);
  const buyInputId = useId();
  const sellInputId = useId();
  // 최대 매수 수량 계산값
  const maxBuyQty = currentPrice > 0 ? Math.floor(cash / currentPrice) : 0;

  // 주문 flash 표시 함수
  const showFlash = (type: 'buy' | 'sell') => {
    // store와 분리된 UI 효과
    setFlash(type);
    window.setTimeout(() => setFlash(null), 320);
  };

  // 매수 버튼 처리 함수
  const handleBuy = () => {
    buy(buyQty);
    showFlash('buy');
  };

  // 매도 버튼 처리 함수
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
        {selectedStock && (
          <div className="mb-5 rounded-xl bg-[#f7f8fc] p-4">
            <p className="text-xs font-bold text-[#8b95a7]">{selectedStock.market} · {selectedStock.id}</p>
            <p className="mt-1 text-xl font-black text-[#111827]">{selectedStock.name}</p>
            <p className="mt-2 font-extrabold text-[#5b45f2]">{formatCount(holdings)} 보유</p>
          </div>
        )}
        <div className="space-y-5">
          <div className="rounded-xl border border-[#ded9ff] bg-[#f8f7ff] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-extrabold text-[#5b45f2]">매수</p>
              <button className="text-xs font-extrabold text-[#5b45f2]" onClick={() => setBuyQty(maxBuyQty)}>
                최대 {formatCount(maxBuyQty)}
              </button>
            </div>
            <label htmlFor={buyInputId} className="sr-only">매수 수량</label>
            <input
              id={buyInputId}
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
            <label htmlFor={sellInputId} className="sr-only">매도 수량</label>
            <input
              id={sellInputId}
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
