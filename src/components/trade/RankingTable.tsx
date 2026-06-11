import type { ScenarioRankingItem } from '../../types/trading';
import { formatRate } from '../../utils/format';

interface RankingTableProps {
  rankings: ScenarioRankingItem[];
}

export function RankingTable({ rankings }: RankingTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#edf0f6] bg-white shadow-card">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#f8f9fa] border-b border-[#edf0f6]">
          <tr>
            <th scope="col" className="px-8 py-5 text-base font-black uppercase tracking-wider text-[#7b8496]">순위</th>
            <th scope="col" className="px-8 py-5 text-base font-black uppercase tracking-wider text-[#7b8496]">이름</th>
            <th scope="col" className="px-8 py-5 text-base font-black uppercase tracking-wider text-[#7b8496]">시나리오명</th>
            <th scope="col" className="px-8 py-5 text-right text-base font-black uppercase tracking-wider text-[#7b8496]">수익률</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f3f7]">
          {rankings.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-base font-black text-[#111827]">기록된 시뮬레이션 결과가 없습니다.</p>
                  <p className="text-xs font-semibold text-[#667085]">지금 시나리오 투자 훈련에 참여해 최초의 랭킹 마스터가 되어보세요!</p>
                </div>
              </td>
            </tr>
          ) : (
            rankings.map((item) => (
              <tr 
                key={`${item.userId}-${item.rank}-${item.scenarioId}`} 
                className={`hover:bg-[#fafbff] transition-colors ${item.isCurrentUser ? 'bg-[#f8f7ff]' : ''}`}
              >
                <td className="px-8 py-6 font-bold">
                  <RankBadge rank={item.rank} />
                </td>
                <td className={`px-8 py-6 text-[#111827] ${item.isCurrentUser ? 'font-black' : 'font-semibold'}`}>
                  <span className="align-middle">{item.nickname}</span>
                  {item.isCurrentUser && (
                    <span className="ml-2 rounded-full bg-[#5b45f2] px-2 py-0.5 text-[10px] font-black text-white align-middle">내 기록</span>
                  )}
                </td>
                <td className={`px-8 py-6 text-[#4b5563] ${item.isCurrentUser ? 'font-black' : 'font-medium'}`}>{item.scenarioTitle}</td>
                <td className={`px-8 py-6 text-right font-black text-base ${item.profitRate >= 0 ? 'text-[#14a86b]' : 'text-[#ff3f55]'}`}>
                  {formatRate(item.profitRate)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#fbbf24] text-xs font-black text-white shadow-sm">{rank}</span>;
  }
  if (rank === 2) {
    return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#94a3b8] text-xs font-black text-white shadow-sm">{rank}</span>;
  }
  if (rank === 3) {
    return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#c2713a] text-xs font-black text-white shadow-sm">{rank}</span>;
  }
  return <span className="text-sm font-bold text-[#8b95a7] pl-2">{rank}</span>;
}