// Modi 매매 기록 컴포넌트
import type { Trade } from '../../types';
import { formatKRW } from '../../utils/format';

interface TradeHistoryProps {
  trades: Trade[];
}

// 매매 기록 테이블 컴포넌트
export function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-[#dfe3ee] bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-[#111827]">매매 기록</h2>
        <span className="text-sm font-extrabold text-[#7b8496]">{trades.length}회</span>
      </div>
      {trades.length === 0 ? (
        <div className="rounded-3xl bg-[#f7f8fc] p-6 text-center text-sm font-bold text-[#7b8496]">
          아직 체결된 주문이 없습니다.
        </div>
      ) : (
        // 모바일 가로 스크롤 테이블
        <div className="max-h-[390px] overflow-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="sticky top-0 bg-white text-xs uppercase text-[#8b95a7]">
              <tr>
                <th className="py-3">날짜</th>
                <th>종목</th>
                <th>구분</th>
                <th>수량</th>
                <th>가격</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, index) => (
                <tr key={`${trade.date}-${trade.type}-${index}`} className="border-t border-[#edf0f6]">
                  <td className="py-3 text-[#4b5563]">{trade.date}</td>
                  <td className="font-extrabold text-[#111827]">{trade.stockName}</td>
                  <td className={trade.type === 'buy' ? 'font-extrabold text-[#5b45f2]' : 'font-extrabold text-[#ff3f55]'}>
                    {trade.type === 'buy' ? '매수' : '매도'}
                  </td>
                  <td className="text-[#4b5563]">{trade.qty.toLocaleString('ko-KR')}주</td>
                  <td className="text-[#4b5563]">{formatKRW(trade.price)}</td>
                  <td className="font-extrabold text-[#111827]">{formatKRW(trade.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
