// Modi 종목 목록 컴포넌트
import { useTradeContext } from '../../context/TradeContext';
import { getStockPriceAtProgress } from '../../utils/marketTime';
import { formatCount, formatKRW, formatRate } from '../../utils/format';

// 시나리오 대표 종목 리스트 컴포넌트
export function StockList() {
  const { scenarioStocks, selectedStockId, selectStock, currentDay, dayProgress, positions } = useTradeContext();

  return (
    <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-[#111827]">대표 종목 20</h2>
        <span className="text-sm font-extrabold text-[#667085]">{scenarioStocks.length}개</span>
      </div>
      <div className="grid max-h-[720px] gap-3 overflow-auto pr-1">
        {scenarioStocks.map((stock) => {
          // 종목별 현재가 계산
          const price = getStockPriceAtProgress(stock, currentDay, dayProgress);
          const bar = stock.bars[currentDay];
          const previousClose = currentDay > 0 ? stock.bars[currentDay - 1]?.close : bar?.open;
          // 리스트 등락률 계산
          const changeRate = previousClose && previousClose > 0 ? (price - previousClose) / previousClose : 0;
          const quantity = positions[stock.id]?.quantity ?? 0;
          const isSelected = stock.id === selectedStockId;

          return (
            <button
              key={stock.id}
              className={`rounded-2xl border p-4 text-left transition ${isSelected ? 'border-[#5b45f2] bg-[#f8f7ff]' : 'border-[#edf0f6] bg-white hover:bg-[#fbfbfe]'}`}
              onClick={() => selectStock(stock.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#8b95a7]">{stock.market} · {stock.id}</p>
                  <h3 className="mt-1 font-black text-[#111827]">{stock.name}</h3>
                  <p className="mt-2 text-xs font-bold text-[#667085]">보유 {formatCount(quantity)}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#111827]">{formatKRW(price)}</p>
                  <p className={`mt-1 text-xs font-extrabold ${changeRate >= 0 ? 'text-[#16a34a]' : 'text-[#ff3f55]'}`}>
                    {formatRate(changeRate)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
