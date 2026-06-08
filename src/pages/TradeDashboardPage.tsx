// Modi 시나리오 랭킹 페이지
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { Header } from '../components/ui/Header'; 
import { Button } from '../components/ui/Button';
import { RankingTable } from '../components/trade/RankingTable';
import { ModeSelectModal } from '../components/ui/ModeSelectModal'; 
import { apiGet } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import type { ScenarioRankingItem } from '../types/trading';

const SCENARIO_FILTERS = [
  { id: '', label: '전체' },
  { id: 'corona', label: '코로나 폭락장' },
  { id: 'subprime', label: '서브프라임 사태' },
  { id: 'dotcom', label: '닷컴버블 붕괴' },
];

export function TradeDashboardPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthContext();
  const [rankings, setRankings] = useState<ScenarioRankingItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [message, setMessage] = useState('');
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
      <>
        {/* Header 영역 */}
        <Header />

        {/* Main 영역 */}
        <motion.main 
          className="max-w-[90rem] mx-auto mt-24 w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
        >
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
                className="px-5 py-3 text-sm bg-white border border-[#dfe3ee] shadow-sm font-black text-[#5b45f2] rounded-full hover:bg-[#f8f7ff] hover:border-[#5b45f2] transition-all" 
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
        
          {/* 랭킹 테이블 */}
          <RankingTable rankings={renumbered} />

        </motion.main>
      
        {/* 모드 선택 모달 */}
        <ModeSelectModal isOpen={isModeModalOpen} onClose={() => setIsModeModalOpen(false)} />
      </>
  );
}