// Modi 시나리오 랭킹 페이지
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { ModeSelectModal } from '../components/ui/ModeSelectModal'; // 공통 모드선택 모달
import { apiGet } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import type { ScenarioRankingItem } from '../types/trading';
import { formatRate } from '../utils/format';

const SCENARIO_FILTERS = [
  { id: '', label: '전체' },
  { id: 'corona', label: '코로나 폭락장' },
  { id: 'subprime', label: '서브프라임 사태' },
  { id: 'dotcom', label: '닷컴버블 붕괴' },
];

export function TradeDashboardPage() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuthContext();
  const [rankings, setRankings] = useState<ScenarioRankingItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [message, setMessage] = useState('');
  
  // 모달 트리거 스위치 상태 관리
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      void refreshUser().then((resolved) => {
        if (!resolved) {
          navigate('/login?next=/trade');
        }
      });
    }
  }, [refreshUser, user, navigate]);

  const loadRankings = useCallback(async () => {
    const items = await apiGet<ScenarioRankingItem[]>('/scenario-rankings');
    setRankings(items);
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }
    loadRankings().catch((error) =>
      setMessage(error instanceof Error ? error.message : '랭킹을 불러오지 못했습니다.'),
    );
    const timer = setInterval(loadRankings, 10000);
    return () => clearInterval(timer);
  }, [loadRankings, user]);

  const filtered = activeFilter ? rankings.filter((item) => item.scenarioId === activeFilter) : rankings;
  const renumbered = filtered.map((item, index) => ({ ...item, rank: index + 1 }));

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#eef1ff] via-[#f5f7ff] to-[#f8f9fa] px-8 pb-20">
      
      {/* Header 영역 */}
      <header className="flex w-full max-w-[90rem] justify-between items-center mx-auto pt-8">
        <BrandLogo />
        
        <nav className="hidden items-center gap-[6rem] text-[15px] font-bold text-[#111827] md:flex">
          <button className="hover:text-[#5b45f2] transition-colors duration-500 ease-in-out" onClick={() => navigate('/select')}>
            시나리오 투자
          </button>
          <button className="hover:text-[#5b45f2] transition-colors duration-500 ease-in-out" onClick={() => navigate('/tutorial')}>
            학습 가이드
          </button>
          <button className="text-[#5b45f2] transition-colors duration-500 ease-in-out" onClick={() => navigate('/trade')}>
            순위 대시보드
          </button>
        </nav>

        <div className="flex items-center gap-5">
          <span className="hidden text-[15px] font-bold text-[#111827] sm:block">
            <span className="text-[#5b45f2] font-black">{user.nickname}</span>님
          </span>
          <Button variant="primary" className="px-5 py-2 text-xs font-bold rounded-full shadow-sm" onClick={() => logout()}>
            로그아웃
          </Button>
        </div>
      </header>

      {/* Main 영역 */}
      <main className="max-w-[90rem] mx-auto mt-24 w-full">

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start border-b border-[#edf0f6] pb-8">
          <div>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-[#111827] sm:text-4xl">
              시뮬레이션 전체 랭킹
            </h1>
            <p className="mt-3 text-[20px] font-medium text-[#667085]">
              전체 유저들의 시나리오별 모의투자 결과 순위 리포트입니다.
            </p>
            {user.provider === 'GUEST' && (
              <p className="mt-3 text-xs font-black text-[#ff3f55]">⚠️ 게스트 로그인은 랭킹 기록이 반영되지 않습니다.</p>
            )}
          </div>

          <div className="shrink-0 mt-2">
            <Button 
              variant="ghost" 
              className="px-5 py-3 text-sm bg-white border border-[#dfe3ee] shadow-sm font-black text-[#5b45f2] rounded-xl hover:bg-[#f8f7ff] hover:border-[#5b45f2] transition-all" 
              onClick={() => setIsModeModalOpen(true)}
            >
              모드 선택
            </Button>
          </div>
        </div>

        {message && (
          <p className="mt-6 rounded-xl bg-[#fff0f2] p-4 text-sm font-bold text-[#ff3f55]">{message}</p>
        )}

        <div className="mt-10 mb-8 flex flex-wrap gap-2">
          {SCENARIO_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition tracking-tight ${
                activeFilter === filter.id
                  ? 'bg-[#5b45f2] text-white shadow-md'
                  : 'bg-white border border-[#dfe3ee] text-[#667085] hover:bg-[#f3f4f8]'
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#edf0f6] bg-white shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#f8f9fa] border-b border-[#edf0f6]">
              <tr>
                <th scope="col" className="px-8 py-6 text-base font-black uppercase tracking-wider text-[#7b8496]">순위</th>
                <th scope="col" className="px-8 py-6 text-base font-black uppercase tracking-wider text-[#7b8496]">이름</th>
                <th scope="col" className="px-8 py-6 text-base font-black uppercase tracking-wider text-[#7b8496]">시나리오명</th>
                <th scope="col" className="px-8 py-6 text-right text-base font-black uppercase tracking-wider text-[#7b8496]">수익률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f7]">
              {renumbered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-base font-black text-[#111827]">기록된 시뮬레이션 결과가 없습니다.</p>
                      <p className="text-xs font-semibold text-[#667085]">지금 시나리오 투자 훈련에 참여해 최초의 랭킹 마스터가 되어보세요!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                renumbered.map((item) => (
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
      </main>

      <ModeSelectModal isOpen={isModeModalOpen} onClose={() => setIsModeModalOpen(false)} />
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