import { useTradeStore } from '../../store/tradeStore';
import { formatKRW } from '../../utils/format';

export function AssetStatus() {
  const positionCount = useTradeStore((state) => state.positionList().length);
  const totalPurchaseAmount = useTradeStore((state) => state.totalPurchaseAmount());
  const totalEvaluationAmount = useTradeStore((state) => state.totalEvaluationAmount());
  const estimatedAssets = useTradeStore((state) => state.estimatedAssets());
  const realizedProfit = useTradeStore((state) => state.realizedProfit);
  const realizedProfitColor = realizedProfit >= 0 ? 'text-[#16a34a]' : 'text-[#ff3f55]';

  return (
    <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-black text-[#111827]">내 자산 현황</h2>
        <span className="rounded-full bg-[#f3f4f8] px-3 py-1 text-xs font-extrabold text-[#5b45f2]">
          보유 {positionCount.toLocaleString('ko-KR')}개
        </span>
      </div>
      <div className="grid gap-3">
        <div className="rounded-xl bg-[#f7f8fc] p-4">
          <p className="text-xs font-bold text-[#7b8496]">추정자산</p>
          <p className="mt-1 text-2xl font-black text-[#111827]">{formatKRW(estimatedAssets)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#f7f8fc] p-4">
            <p className="text-xs font-bold text-[#7b8496]">총매입금액</p>
            <p className="mt-1 font-extrabold text-[#111827]">{formatKRW(totalPurchaseAmount)}</p>
          </div>
          <div className="rounded-xl bg-[#f7f8fc] p-4">
            <p className="text-xs font-bold text-[#7b8496]">총평가금액</p>
            <p className="mt-1 font-extrabold text-[#111827]">{formatKRW(totalEvaluationAmount)}</p>
          </div>
        </div>
        <div className="rounded-xl bg-[#f7f8fc] p-4">
          <p className="text-xs font-bold text-[#7b8496]">실현손익</p>
          <p className={`mt-1 font-black ${realizedProfitColor}`}>{formatKRW(realizedProfit)}</p>
        </div>
      </div>
    </section>
  );
}
