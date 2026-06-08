// Modi 시나리오 투자 결과 페이지
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubHeader } from '../components/ui/SubHeader';
import { InvestorBadge } from '../components/result/InvestorBadge';
import { ProfitChart } from '../components/result/ProfitChart';
import { TradeHistory } from '../components/result/TradeHistory';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { Mascot } from '../components/ui/Mascot';
import { useTradeContext } from '../context/TradeContext';
import { calcHoldReturnFromStocks, calcPortfolioTimeSeriesFromStocks } from '../utils/calcMetrics';
import { formatRate } from '../utils/format';

export function ResultPage() {
  const navigate = useNavigate();
  const { scenario, scenarioStocks, tradeHistory, maxDrawdown, profitRate, reset } = useTradeContext();
  
  const holdReturn = scenario ? calcHoldReturnFromStocks(scenarioStocks, scenario.initialCash) : 0;
  const series = useMemo(
    () => (scenario ? calcPortfolioTimeSeriesFromStocks(scenarioStocks, tradeHistory, scenario.initialCash) : []),
    [scenario, scenarioStocks, tradeHistory],
  );

  useEffect(() => {
    if (!scenario) {
      navigate('/select');
    }
  }, [navigate, scenario]);

  if (!scenario) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-0">
      <div className="w-full">
        
        {/* Header 영역 */}
        <SubHeader title="투자 결과 리포트" description={`${scenario.title} · 시뮬레이션 최종 스코어`}>
      
          <Button className="px-4 py-1.5 text-xs font-bold shadow-sm rounded-full"
            onClick={() => {
              reset();
              navigate('/select');
            }}
          >
            다른 시나리오 도전하기
          </Button>
  
          <Button 
            variant="ghost" 
            className="px-4 py-1.5 text-xs bg-white border border-[#dfe3ee] shadow-sm font-bold" 
            onClick={() => navigate('/')}
          >
            홈으로 가기
          </Button>
        </SubHeader>

        {/* Body 영역: 2열 대시보드 구조 */}
        <div className="w-full px-6 mt-6 grid gap-6 grid-cols-1 md:grid-cols-2 items-start">
          
          {/* 1열: 완료 배너, 탭 바, 자산 차트 */}
          <div className="flex flex-col gap-5 min-w-0">
            
            {/* 완료 배너 */}
            <div className="relative overflow-hidden rounded-3xl border border-[#dfe3ee] bg-white p-6 shadow-sm">
              <div className="absolute bottom-2 right-6 hidden sm:block">
                <Mascot className="h-16 w-16" />
              </div>
              <p className="text-xs font-extrabold text-[#5b45f2] uppercase tracking-wider">시뮬레이션 완료</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-[#111827] sm:text-2xl">시뮬레이션이 완료되었습니다!</h2>
              <p className="mt-2 text-[14px] font-semibold leading-5 text-[#667085]">{scenario.revealText}</p>
            </div>

            {/* 투자 자산 추이 차트판 */}
            <div className="rounded-3xl border border-[#dfe3ee] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-black text-[#111827] mb-4">투자 자산 추이 차트</h3>
              <ProfitChart series={series} />
            </div>

          </div>
          
          {/* 2열: 상하 해상도 노이즈가 제거된 3행 스택 구조 */}
          <div className="flex flex-col gap-5 min-w-0">
            
            <InvestorBadge rate={profitRate} />

            <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
              <MetricCard title="내 최종 수익률" value={formatRate(profitRate)} tone={profitRate >= 0 ? 'good' : 'bad'} />
              <MetricCard title="존버 수익률" value={formatRate(holdReturn)} tone={holdReturn >= 0 ? 'good' : 'bad'} />
              <MetricCard title="최대 낙폭 MDD" value={formatRate(maxDrawdown)} tone="bad" />
              <MetricCard title="총 매매 횟수" value={`${tradeHistory.length}회`} tone="neutral" />
            </div>
 

            <TradeHistory trades={tradeHistory} />
            
          </div>

        </div>

        <div className="pt-4 pb-4" />

      </div>
    </main>
  );
}

// 지표 개별 카드 서브 컴포넌트
function MetricCard({ title, value, tone }: { title: string; value: string; tone: 'good' | 'bad' | 'neutral' }) {
  const toneClass = {
    good: 'text-[#16a34a]',
    bad: 'text-[#ff3f55]',
    neutral: 'text-[#111827]',
  }[tone];

  return (
    <div className="rounded-3xl border border-[#dfe3ee] bg-white p-4 shadow-sm flex flex-col justify-between min-h-[96px]">
      <p className="text-[11px] font-extrabold text-[#667085] uppercase tracking-wider leading-tight">{title}</p>
      <p className={`mt-2 text-xl font-black tracking-tight ${toneClass}`}>{value}</p>
    </div>
  );
}