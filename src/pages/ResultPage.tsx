import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvestorBadge } from '../components/result/InvestorBadge';
import { ProfitChart } from '../components/result/ProfitChart';
import { TradeHistory } from '../components/result/TradeHistory';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { Mascot } from '../components/ui/Mascot';
import { useTradeStore } from '../store/tradeStore';
import { calcHoldReturn, calcHoldReturnFromStocks, calcPortfolioTimeSeries, calcPortfolioTimeSeriesFromStocks } from '../utils/calcMetrics';
import { formatRate } from '../utils/format';

export function ResultPage() {
  const navigate = useNavigate();
  const scenario = useTradeStore((state) => state.scenario);
  const scenarioStocks = useTradeStore((state) => state.scenarioStocks);
  const chartData = useTradeStore((state) => state.chartData);
  const tradeHistory = useTradeStore((state) => state.tradeHistory);
  const maxDrawdown = useTradeStore((state) => state.maxDrawdown);
  const profitRate = useTradeStore((state) => state.profitRate());
  const reset = useTradeStore((state) => state.reset);
  const holdReturn = scenario ? (scenarioStocks.length ? calcHoldReturnFromStocks(scenarioStocks, scenario.initialCash) : calcHoldReturn(chartData, scenario.initialCash)) : 0;
  const series = useMemo(
    () => (scenario ? (scenarioStocks.length ? calcPortfolioTimeSeriesFromStocks(scenarioStocks, tradeHistory, scenario.initialCash) : calcPortfolioTimeSeries(chartData, tradeHistory, scenario.initialCash)) : []),
    [chartData, scenario, scenarioStocks, tradeHistory],
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
    <main className="min-h-screen px-5 py-5">
      <section className="mx-auto grid max-w-6xl gap-6 rounded-2xl border border-[#dfe3ee] bg-white p-3 shadow-card sm:p-5">
        <header className="flex items-center justify-between">
          <BrandLogo />
          <Button variant="ghost" className="px-4 py-2 text-xs" onClick={() => navigate('/')}>
            홈으로
          </Button>
        </header>
        <div className="relative overflow-hidden rounded-2xl border border-[#dfe3ee] bg-white p-8 text-center shadow-card">
          <div className="absolute bottom-2 right-6 hidden sm:block">
            <Mascot className="h-24 w-24" />
          </div>
          <p className="text-sm font-extrabold text-[#5b45f2]">시뮬레이션 완료</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#111827] sm:text-5xl">시뮬레이션이 완료되었습니다! 🎉</h1>
          <p className="mx-auto mt-4 max-w-3xl font-medium leading-7 text-[#667085]">{scenario.revealText}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard title="내 최종 수익률" value={formatRate(profitRate)} tone={profitRate >= 0 ? 'good' : 'bad'} />
          <MetricCard title="존버 수익률" value={formatRate(holdReturn)} tone={holdReturn >= 0 ? 'good' : 'bad'} />
          <MetricCard title="최대 낙폭 MDD" value={formatRate(maxDrawdown)} tone="bad" />
          <MetricCard title="총 매매 횟수" value={`${tradeHistory.length}회`} tone="neutral" />
        </div>
        <div className="rounded-2xl border border-[#dfe3ee] bg-white p-2 shadow-card">
          <div className="grid gap-1 rounded-xl bg-[#f7f8fc] p-1 text-center text-sm font-extrabold sm:grid-cols-3">
            <span className="rounded-lg bg-white px-4 py-3 text-[#5b45f2] shadow-sm">성과 요약</span>
            <span className="px-4 py-3 text-[#667085]">자산 흐름</span>
            <span className="px-4 py-3 text-[#667085]">거래 내역</span>
          </div>
        </div>
        <ProfitChart series={series} />
        <InvestorBadge rate={profitRate} />
        <TradeHistory trades={tradeHistory} />
        <div className="flex justify-center">
          <Button
            className="px-8"
            onClick={() => {
              reset();
              navigate('/select');
            }}
          >
            다른 시나리오 도전하기
          </Button>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ title, value, tone }: { title: string; value: string; tone: 'good' | 'bad' | 'neutral' }) {
  const toneClass = {
    good: 'text-[#16a34a]',
    bad: 'text-[#ff3f55]',
    neutral: 'text-[#111827]',
  }[tone];

  return (
    <div className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
      <p className="text-sm font-extrabold text-[#667085]">{title}</p>
      <p className={`mt-3 text-3xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
}
