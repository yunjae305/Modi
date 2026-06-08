// Modi 시나리오 랭킹 페이지
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { ModeSelectModal } from '../components/ui/ModeSelectModal'; // 🌟 분리한 공통 모드선택 모달 도입
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
  
  // 🌟 모달 트리거 스위치 상태 관리
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
    <div className="min-h-screen bg-[#f8f9fa] px-6 pb-12">
      
      {/* 🌟 1. LandingPage 순정 헤더(GNB) 프레임 이식 완료[cite: 9] */}
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

        {/* 우측 사용자 프로필 액션 파트[cite: 9, 10] */}
        <div className="flex items-center gap-4">
          <span className="hidden text-[15px] font-bold text-[#111827] sm:block">
            <span className="text-[#5b45f2] font-black">{user.nickname}</span>님
          </span>
          {/* 🌟 기존 버튼 유지 ➡️ 누르면 라우터 이동 대신 모달 팝업 가동 */}
          <Button variant="ghost" className="px-4 py-2 text-xs bg-white border border-[#dfe3ee] shadow-sm font-bold" onClick={() => setIsModeModalOpen(true)}>
            모드 선택
          </Button>
          <Button variant="primary" className="px-4 py-2 text-xs font-bold" onClick={() => logout()}>
            로그아웃
          </Button>
        </div>
      </header>

      {/* 🌟 2. Body 영역: 전체 레이아웃 정렬을 위해 max-w-5xl 확장 개편[cite: 8] */}
      <section className="mx-auto max-w-5xl mt-10 rounded-2xl border border-[#dfe3ee] bg-white shadow-card overflow-hidden">
        
        {/* 내부 서브 타이틀 바 영역[cite: 8] */}
        <div className="border-b border-[#edf0f6] px-6 py-5 bg-[#fafbff]">
          <h2 className="text-xl font-black text-[#111827]">시뮬레이션 전체 랭킹</h2>
          <p className="mt-1 text-xs font-bold text-[#667085]">유저들의 시나리오별 실시간 모의투자 순위 리포트입니다.</p>
          {user.provider === 'GUEST' && (
            <p className="mt-1.5 text-xs font-black text-[#ff3f55]">⚠️ 게스트 로그인은 랭킹 기록이 보존되지 않습니다.</p>
          )}
        </div>

        <div className="p-6">
          {message && (
            <p className="mb-4 rounded-xl bg-[#fff0f2] p-3 text-sm font-bold text-[#ff3f55]">{message}</p>
          )}
          
          {/* 시나리오 필터링 단추 그룹[cite: 8] */}
          <div className="mb-5 flex flex-wrap gap-2">
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

          {/* 메인 데이터 테이블 보드[cite: 8] */}
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
                      아직 등록된 시뮬레이션 결과가 존재하지 않습니다.
                    </td>
                  </tr>
                ) : (
                  renumbered.map((item) => (
                    <tr 
                      key={`${item.userId}-${item.rank}-${item.scenarioId}`} 
                      className={`border-t border-[#edf0f6] hover:bg-[#fafbff] transition-colors ${item.isCurrentUser ? 'bg-[#f8f7ff] font-black' : ''}`}
                    >
                      <td className="px-5 py-4">
                        <RankBadge rank={item.rank} />
                      </td>
                      <td className={`px-5 py-4 text-[#111827] ${item.isCurrentUser ? 'font-black' : 'font-bold'}`}>
                        <span>{item.nickname}</span>
                        {item.isCurrentUser && (
                          <span className="ml-2 rounded-full bg-[#5b45f2] px-2 py-0.5 text-[10px] font-black text-white">내 기록</span>
                        )}
                      </td>
                      <td className={`px-5 py-4 text-[#4b5563] ${item.isCurrentUser ? 'font-black' : 'font-bold'}`}>{item.scenarioTitle}</td>
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

      {/* 🌟 3. 분리 격리해둔 공통 모드 선택 컴포넌트 결합 완료 */}
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