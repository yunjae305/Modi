import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubHeader } from '../components/ui/SubHeader';
import { CandleChart } from '../components/chart/CandleChart';
import { TradeHistory } from '../components/result/TradeHistory';
import { AssetStatus } from '../components/trade/AssetStatus';
import { MarketTimeControls } from '../components/trade/MarketTimeControls';
import { NextDayButton } from '../components/trade/NextDayButton';
import { StockList } from '../components/trade/StockList';
import { TradePanel } from '../components/trade/TradePanel';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useChartData } from '../hooks/useChartData';
import { useSimulation } from '../hooks/useSimulation';
import { useTradeContext } from '../context/TradeContext';
import { Mascot } from '../components/ui/Mascot';

export function SimulationPage() {
  const navigate = useNavigate();
  const { scenario, chartData, currentDay, currentPrice, selectedStock, tradeHistory, reset } = useTradeContext();
  const { loading, error } = useChartData(scenario);
  useSimulation();

  const [activeModal, setActiveModal] = useState<'change' | 'giveup' | null>(null);
  
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5b45f2] border-t-transparent" />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 bg-[#f8f9fa]">
        <div className="rounded-2xl border border-[#dfe3ee] bg-white p-8 text-center shadow-sm max-w-sm w-full">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#5b45f2] border-t-transparent" />
          <p className="text-xl font-black text-[#111827]">차트 데이터를 불러오는 중</p>
          <p className="mt-2 font-medium text-[#667085]">{scenario.subtitle}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 bg-[#f8f9fa]">
        <div className="max-w-md rounded-2xl border border-[#ffd6dc] bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-black text-[#111827]">데이터를 불러오지 못했습니다.</p>
          <p className="mt-3 font-bold text-[#ff3f55]">{error}</p>
          <button className="mt-6 text-sm font-extrabold text-[#5b45f2] underline" onClick={() => navigate('/select')}>
            시나리오 선택으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  const handleModalConfirm = () => {
    if (activeModal === 'change') {
      reset();
      navigate('/select');
    } else if (activeModal === 'giveup') {
      reset();
      navigate('/');
    }
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      
      {/* Header 영역 */}
      <SubHeader title={`${scenario.title} (${scenario.subtitle})`}
        description={selectedStock ? `${selectedStock.name} · ${selectedStock.id}` : `${scenario.market} · ${scenario.lesson}`}
      >

      <Button variant="ghost" className="px-3 py-1.5 text-xs bg-white border border-[#dfe3ee] shadow-sm font-bold" onClick={() => setActiveModal('change')}>
        시나리오 변경
      </Button>

      <Button
        className="rounded-full bg-[#8B0000] px-3 py-1.5 text-xs font-bold text-[#ffffff] hover:bg-[#FF0000] shadow-sm transition-colors"
        onClick={() => setActiveModal('giveup')}
      >
        포기하기
      </Button>
    </SubHeader>

      {/* 4열 레이아웃 바디 */}
      <div className="pt-5 pb-6 px-6 w-full grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)_310px_340px] lg:grid-cols-[260px_minmax(0,1fr)_280px_280px] md:grid-cols-2 grid-cols-1">
        
        {/* 1열: 종목 리스트 */}
        <div className="min-w-0">
          <StockList />
        </div>
        
        {/* 2열: 차트, 매매 기록 */}
        <div className="flex flex-col gap-5 min-w-0">
          <section className="rounded-2xl border border-[#dfe3ee] bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold text-[#8b95a7] uppercase tracking-wider">{selectedStock ? `${selectedStock.market} · ${selectedStock.id}` : scenario.market}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-2xl font-black text-[#111827] tracking-tight">{currentPrice.toLocaleString('ko-KR')}</h2>
                  <span className="text-[10px] font-extrabold text-[#16a34a] bg-[#f0fdf4] px-1.5 py-0.5 rounded-md">실시간 시뮬레이션</span>
                </div>
              </div>
            </div>
            <CandleChart data={liveChartData} visibleCount={currentDay + 1} height={260} />
          </section>
          
          <div className="min-w-0">
            <TradeHistory trades={tradeHistory} />
          </div>
        </div>
        
        {/* 3열: 주문 패널, 알아두기 가이드 배너 */}
        <div className="grid content-start gap-5 min-w-0">
          <TradePanel />
          
          <section className="rounded-2xl border border-[#ded9ff] bg-[#f8f7ff] p-5 shadow-card flex items-center justify-between">
            <div className="max-w-[75%]">
              <h2 className="font-black text-[#5b45f2] text-sm">알아두기</h2>
              <p className="mt-2 text-xs font-semibold leading-5 text-[#667085]">
                강제로 <span className="text-[#5b45f2] font-bold">다음 구간을 이동하면</span> 버튼을 누르는 순간 바로 체결되어 되돌릴 수 없습니다.
              </p>
            </div>
            <Mascot className="h-10 w-10 shrink-0" />
          </section>
        </div>

        {/* 4열: 시나리오 진행, 내 자산 현황, 시장 시간 */}
        <aside className="grid content-start gap-5 min-w-0">
          
          <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#667085]">
              <span className="text-[#111827] font-black text-sm">시나리오 진행</span>
              <span className="text-[#5b45f2]">{currentDay + 1} / {chartData.length} 구간</span>
            </div>
            
            <div className="h-2 w-full rounded-full bg-[#edf0f6] overflow-hidden">
              <div 
                className="h-full rounded-full bg-[#5b45f2] transition-all duration-300" 
                style={{ width: `${Math.max(4, ((currentDay + 1) / Math.max(chartData.length, 1)) * 100)}%` }} 
              />
            </div>
            
            <NextDayButton />
          </section>

          <AssetStatus />
          <MarketTimeControls />
        </aside>

      </div>

      {/* 모달 컴포넌트 */}
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)}>
        <h3 className="text-lg font-black text-[#111827]">
          {activeModal === 'change' ? '시나리오를 변경하시겠어요?' : '시뮬레이션을 포기하시겠어요?'}
        </h3>
        
        <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">
          {activeModal === 'change' 
            ? '현재까지 진행한 모의투자 데이터와 체결 기록이 모두 초기화되며 선택 창으로 이동합니다' 
            : '현재 시나리오의 투자 진행 상황이 전부 유실되며 최초 메인 화면으로 돌아갑니다'}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            className="flex-1 rounded-xl bg-[#f3f4f8] py-3 text-sm font-extrabold text-[#667085] hover:bg-[#eaf0f6] transition-colors"
            onClick={() => setActiveModal(null)}
          >
            돌아가기
          </button>
          <button
            className={`flex-1 rounded-xl py-3 text-sm font-extrabold text-white transition-colors shadow-sm ${
              activeModal === 'change' 
                ? 'bg-[#5b45f2] hover:bg-[#4631d2]' 
                : 'bg-[#8B0000] hover:bg-[#FF0000]'
            }`}
            onClick={handleModalConfirm}
          >
            {activeModal === 'change' ? '변경하기' : '포기하기'}
          </button>
        </div>
      </Modal>

    </div>
  );
}