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
    <div className="min-h-screen bg-[#f8f9fa] px-8 pb-16">
      
      {/* Header 영역 - LandingPage와 좌우 정렬 선 완벽 대칭[cite: 9] */}
      <header className="flex items-center justify-between pt-8 max-w-[90rem] mx-auto border-b border-[#edf0f6] pb-5">
        <BrandLogo />
        
        {/* 글로벌 공통 내비게이션 바 링크 시스템[cite: 9] */}
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

        {/* 우측 사용자 프로필 및 제어 단추[cite: 9, 10] */}
        <div className="flex items-center gap-4">
          <span className="hidden text-[15px] font-bold text-[#111827] sm:block">
            <span className="text-[#5b45f2] font-black">{user.nickname}</span>님
          </span>
          <Button variant="ghost" className="px-4 py-2 text-xs bg-white border border-[#dfe3ee] shadow-sm font-bold" onClick={() => setIsModeModalOpen(true)}>
            모드 선택
          </Button>
          <Button variant="primary" className="px-4 py-2 text-xs font-bold" onClick={() => logout()}>
            로그아웃
          </Button>
        </div>
      </header>

      {/* 🌟 Body 영역 - 답답한 이중 감옥 박스를 파괴하고 max-w-[90rem]로 시원하게 정렬 라인 일치[cite: 8, 9] */}
      <main className="max-w-[90rem] mx-auto mt-12">
        
        {/* 상단 타이틀 코너 및 필터 버튼 수평 배치 조율[cite: 8] */}
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-[#111827] tracking-tight">시뮬레이션 전체 랭킹</h1>
            <p className="mt-2 text-sm font-bold text-[#667085]">전체 유저들의 시나리오별 모의투자 결과 순위 리포트입니다.</p>
            {user.provider === 'GUEST' && (
              <p className="mt-1.5 text-xs font-black text-[#ff3f55]">⚠️ 게스트 로그인은 랭킹 기록이 반영되지 않습니다.</p>
            )}
          </div>

          {/* 시나리오 필터링 버튼 캡슐 - 탁 트인 공간으로 재배치[cite: 8] */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {SCENARIO_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition shadow-sm border ${
                  activeFilter === filter.id
                    ? 'bg-[#5b45f2] border-[#5b45f2] text-white'
                    : 'bg-white border-[#dfe3ee] text-[#667085] hover:bg-[#edf0f6]'
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <p className="mb-6 rounded-xl bg-[#fff0f2] p-4 text-sm font-bold text-[#ff3f55]">{message}</p>
        )}

        {/* 🌟 랭킹 테이블 보드판만 깔끔하게 단독 화이트 카드로 디자인하여 프리미엄 대시보드 핏 완성[cite: 8] */}
        <div className="overflow-hidden rounded-2xl border border-[#dfe3ee] bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f8fc] border-b border-[#edf0f6]">
              <tr>
                <th className="px-6 py-4.5 text-left text-xs font-extrabold text-[#8b95a7] uppercase tracking-wider">순위</th>
                <th className="px-6 py-4.5 text-left text-xs font-extrabold text-[#8b95a7] uppercase tracking-wider">이름</th>
                <th className="px-6 py-4.5 text-left text-xs font-extrabold text-[#8b95a7] uppercase tracking-wider">시나리오명</th>
                <th className="px-6 py-4.5 text-right text-xs font-extrabold text-[#8b95a7] uppercase tracking-wider">수익률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0f6]">
              {renumbered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm font-bold text-[#667085]">
                    아직 등록된 시뮬레이션 결과 데이터가 존재하지 않습니다.
                  </td>
                </tr>
              ) : (
                renumbered.map((item) => (
                  <tr 
                    key={`${item.userId}-${item.rank}-${item.scenarioId}`} 
                    className={`hover:bg-[#fafbff] transition-colors ${item.isCurrentUser ? 'bg-[#f8f7ff] font-black' : ''}`}
                  >
                    <td className="px-6 py-4.5">
                      <RankBadge rank={item.rank} />
                    </td>
                    <td className={`px-6 py-4.5 text-[#111827] ${item.isCurrentUser ? 'font-black' : 'font-bold'}`}>
                      <span>{item.nickname}</span>
                      {item.isCurrentUser && (
                        <span className="ml-2 rounded-full bg-[#5b45f2] px-2 py-0.5 text-[10px] font-black text-white">내 기록</span>
                      )}
                    </td>
                    <td className={`px-6 py-4.5 text-[#4b5563] ${item.isCurrentUser ? 'font-black' : 'font-bold'}`}>{item.scenarioTitle}</td>
                    <td className={`px-6 py-4.5 text-right font-black ${item.profitRate >= 0 ? 'text-[#14a86b]' : 'text-[#ff3f55]'}`}>
                      {formatRate(item.profitRate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 공통 모드 선택 컴포넌트 부품 결합 */}
      <ModeSelectModal isOpen={isModeModalOpen} onClose={() => setIsModeModalOpen(false)} />
    </div>
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