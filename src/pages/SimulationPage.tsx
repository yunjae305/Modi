import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandleChart } from '../components/chart/CandleChart';
import { TradeHistory } from '../components/result/TradeHistory';
import { AssetStatus } from '../components/trade/AssetStatus';
import { MarketTimeControls } from '../components/trade/MarketTimeControls';
import { NextDayButton } from '../components/trade/NextDayButton';
import { StockList } from '../components/trade/StockList';
import { TradePanel } from '../components/trade/TradePanel';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { Mascot } from '../components/ui/Mascot';
import { useChartData } from '../hooks/useChartData';
import { useSimulation } from '../hooks/useSimulation';
import { useTradeStore } from '../store/tradeStore';

export function SimulationPage() {
  const navigate = useNavigate();
  const scenario = useTradeStore((state) => state.scenario);
  const chartData = useTradeStore((state) => state.chartData);
  const currentDay = useTradeStore((state) => state.currentDay);
  const currentPrice = useTradeStore((state) => state.currentPrice());
  const selectedStock = useTradeStore((state) => state.selectedStock());
  const tradeHistory = useTradeStore((state) => state.tradeHistory);
  const reset = useTradeStore((state) => state.reset);
  const { loading, error } = useChartData(scenario);
  useSimulation();
  const liveChartData = useMemo(
    () => chartData.map((bar, index) => (
      index === currentDay
        ? {
            ...bar,
            high: Math.max(bar.high, currentPrice),
            low: Math.min(bar.low, currentPrice),
            close: currentPrice,
          }
        : bar
    )),
    [chartData, currentDay, currentPrice],
  );

  useEffect(() => {
    if (!scenario) {
      navigate('/select');
    }
  }, [navigate, scenario]);

  if (!scenario) {
    return null;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-2xl border border-[#dfe3ee] bg-white p-8 text-center shadow-card">
          <p className="text-xl font-black text-[#111827]">차트 데이터를 불러오는 중입니다.</p>
          <p className="mt-2 font-medium text-[#667085]">{scenario.subtitle}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-[#ffd6dc] bg-white p-8 text-center shadow-card">
          <p className="text-xl font-black text-[#111827]">데이터를 불러오지 못했습니다.</p>
          <p className="mt-3 font-bold text-[#ff3f55]">{error}</p>
          <button className="mt-6 text-sm font-extrabold text-[#5b45f2] underline" onClick={() => navigate('/select')}>
            시나리오 선택으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-5">
      <section className="mx-auto max-w-7xl rounded-2xl border border-[#dfe3ee] bg-white shadow-card">
        <header className="flex flex-col gap-4 border-b border-[#edf0f6] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <BrandLogo />
            <div className="hidden h-8 w-px bg-[#edf0f6] sm:block" />
            <div>
              <h1 className="text-sm font-black text-[#111827]">{scenario.title} ({scenario.subtitle})</h1>
              <p className="mt-1 text-xs font-bold text-[#667085]">
                {selectedStock ? `${selectedStock.name} · ${selectedStock.id}` : scenario.market} · {scenario.lesson}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-xl border border-[#dfe3ee] px-4 py-2 text-xs font-extrabold text-[#667085] md:flex">
              <span>진행률</span>
              <span className="h-2 w-28 rounded-full bg-[#edf0f6]">
                <span className="block h-full rounded-full bg-[#5b45f2]" style={{ width: `${Math.max(4, ((currentDay + 1) / Math.max(chartData.length, 1)) * 100)}%` }} />
              </span>
              <span>{currentDay + 1} / {chartData.length}일</span>
            </div>
            <Button variant="ghost" className="px-4 py-2 text-xs" onClick={() => navigate('/select')}>
              시나리오 변경
            </Button>
          <button
            className="rounded-xl border border-[#dfe3ee] px-4 py-2 text-xs font-extrabold text-[#667085] hover:bg-[#f7f8fc]"
            onClick={() => {
              if (window.confirm('현재 시뮬레이션을 포기하고 처음으로 돌아갈까요?')) {
                reset();
                navigate('/');
              }
            }}
          >
            포기하기
          </button>
          </div>
        </header>
        <div className="grid gap-5 p-5 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <StockList />
          <div className="grid min-w-0 content-start gap-5">
            <section className="min-w-0 rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold text-[#667085]">{selectedStock ? `${selectedStock.market} · ${selectedStock.id}` : scenario.market}</p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-3">
                    <h2 className="text-3xl font-black text-[#111827]">{currentPrice.toLocaleString('ko-KR')}</h2>
                    <span className="font-extrabold text-[#16a34a]">실시간형 시뮬레이션</span>
                  </div>
                </div>
                <div className="flex rounded-xl bg-[#f7f8fc] p-1 text-xs font-extrabold text-[#667085]">
                  {['1D', '1W', '1M', '3M'].map((item, index) => (
                    <span key={item} className={`rounded-lg px-3 py-2 ${index === 1 ? 'bg-white text-[#5b45f2] shadow-sm' : ''}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <CandleChart data={liveChartData} visibleCount={currentDay + 1} height={320} />
            </section>
            <TradeHistory trades={tradeHistory} />
          </div>
          <aside className="grid content-start gap-5">
            <AssetStatus />
            <TradePanel />
            <MarketTimeControls />
            <NextDayButton />
            <section className="rounded-2xl border border-[#ded9ff] bg-[#f8f7ff] p-5">
              <h2 className="font-black text-[#5b45f2]">도움말</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">다음 날로 이동하면 모든 주문이 체결되고 시장이 변합니다.</p>
              <Mascot className="mt-4 h-20 w-20" />
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
