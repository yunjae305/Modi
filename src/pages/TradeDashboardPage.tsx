import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { apiGet } from '../services/api';
import { useAuthStore } from '../store/authStore';
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
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const loginGuest = useAuthStore((state) => state.loginGuest);
  const logout = useAuthStore((state) => state.logout);
  const [rankings, setRankings] = useState<ScenarioRankingItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      refreshUser();
    }
  }, [refreshUser, user]);

  const loadRankings = useCallback(async () => {
    const items = await apiGet<ScenarioRankingItem[]>('/scenario-rankings');
    setRankings(items);
  }, []);

  useEffect(() => {
    loadRankings().catch((error) =>
      setMessage(error instanceof Error ? error.message : '랭킹을 불러오지 못했습니다.'),
    );
    const timer = setInterval(loadRankings, 10000);
    return () => clearInterval(timer);
  }, [loadRankings]);

  const startGuest = async () => {
    setMessage('');
    await loginGuest();
    await refreshUser();
  };

  const filtered = activeFilter ? rankings.filter((item) => item.scenarioId === activeFilter) : rankings;

  const renumbered = filtered.map((item, index) => ({ ...item, rank: index + 1 }));

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-5">
        <section className="w-full max-w-xl rounded-2xl border border-[#dfe3ee] bg-white p-7 text-center shadow-card">
          <BrandLogo />
          <h1 className="mt-8 text-3xl font-black text-[#111827]">시뮬레이션 랭킹</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-[#667085]">로그인 또는 게스트 세션으로 시나리오 랭킹을 확인하세요.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button onClick={() => navigate('/login?next=/trade')}>로그인</Button>
            <Button variant="ghost" onClick={startGuest}>게스트로 시작</Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-5">
      <section className="mx-auto max-w-4xl rounded-2xl border border-[#dfe3ee] bg-white shadow-card">
        <header className="flex flex-col gap-4 border-b border-[#edf0f6] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <BrandLogo />
            <div>
              <h1 className="text-xl font-black text-[#111827]">시뮬레이션 랭킹</h1>
              <p className="mt-1 text-xs font-bold text-[#667085]">시나리오 시뮬레이션 결과 순위입니다.</p>
              {user.provider === 'GUEST' && (
                <p className="mt-0.5 text-xs font-bold text-[#ff3f55]">게스트 로그인은 기록이 되지 않습니다.</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#f4f2ff] px-4 py-2 text-xs font-extrabold text-[#5b45f2]">{user.nickname}님</span>
            <Button variant="ghost" className="px-4 py-2 text-xs" onClick={() => navigate('/mode-select')}>모드 선택</Button>
            <Button variant="ghost" className="px-4 py-2 text-xs" onClick={() => logout()}>로그아웃</Button>
          </div>
        </header>
        <div className="p-5">
          {message && (
            <p className="mb-4 rounded-xl bg-[#fff0f2] p-3 text-sm font-bold text-[#ff3f55]">{message}</p>
          )}
          <div className="mb-4 flex flex-wrap gap-2">
            {SCENARIO_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                  activeFilter === filter.id
                    ? 'bg-[#5b45f2] text-white'
                    : 'bg-[#f7f8fc] text-[#667085] hover:bg-[#edf0f6]'
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#dfe3ee]">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f8fc]">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-[#8b95a7]">순위</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-[#8b95a7]">이름</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-[#8b95a7]">시나리오명</th>
                  <th className="px-5 py-4 text-right text-xs font-extrabold text-[#8b95a7]">수익률</th>
                </tr>
              </thead>
              <tbody>
                {renumbered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm font-bold text-[#667085]">
                      아직 시뮬레이션 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  renumbered.map((item) => (
                    <tr key={`${item.rank}-${item.nickname}-${item.scenarioId}`} className="border-t border-[#edf0f6] hover:bg-[#fafbff]">
                      <td className="px-5 py-4">
                        <RankBadge rank={item.rank} />
                      </td>
                      <td className="px-5 py-4 font-black text-[#111827]">{item.nickname}</td>
                      <td className="px-5 py-4 font-bold text-[#4b5563]">{item.scenarioTitle}</td>
                      <td className={`px-5 py-4 text-right font-black ${item.profitRate >= 0 ? 'text-[#14a86b]' : 'text-[#ff3f55]'}`}>
                        {formatRate(item.profitRate)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#fbbf24] text-xs font-black text-white">{rank}</span>;
  }
  if (rank === 2) {
    return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#94a3b8] text-xs font-black text-white">{rank}</span>;
  }
  if (rank === 3) {
    return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#c2713a] text-xs font-black text-white">{rank}</span>;
  }
  return <span className="text-sm font-extrabold text-[#8b95a7]">{rank}</span>;
}
