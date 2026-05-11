import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { apiGet, apiPost } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { ExecutionItem, OrderResult, PortfolioSummary, RankingItem, StockItem } from '../types/trading';
import { formatKRW, formatRate } from '../utils/format';

export function RealTradingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const logout = useAuthStore((state) => state.logout);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [selectedStockId, setSelectedStockId] = useState('005930');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedStock = useMemo(
    () => stocks.find((stock) => stock.id === selectedStockId) ?? stocks[0],
    [selectedStockId, stocks],
  );

  const loadTradingData = async () => {
    const [stockData, portfolioData, executionData, rankingData] = await Promise.all([
      apiGet<StockItem[]>('/stocks'),
      apiGet<PortfolioSummary>('/portfolio'),
      apiGet<ExecutionItem[]>('/executions'),
      apiGet<RankingItem[]>('/rankings'),
    ]);
    setStocks(stockData);
    setPortfolio(portfolioData);
    setExecutions(executionData);
    setRankings(rankingData);
    if (!stockData.some((stock) => stock.id === selectedStockId)) {
      setSelectedStockId(stockData[0]?.id ?? '005930');
    }
  };

  useEffect(() => {
    refreshUser().then((nextUser) => {
      if (!nextUser) {
        navigate('/login?next=/trade', { replace: true });
      }
    });
  }, [navigate, refreshUser]);

  useEffect(() => {
    if (!user) {
      return;
    }
    loadTradingData().catch((error: Error) => setError(error.message));
    const timer = window.setInterval(() => {
      loadTradingData().catch((error: Error) => setError(error.message));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [user]);

  const submitOrder = async (side: 'buy' | 'sell') => {
    if (!selectedStock) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const result = await apiPost<OrderResult>(`/orders/${side}`, {
        stockId: selectedStock.id,
        quantity,
      });
      setMessage(`${side === 'buy' ? '매수' : '매도'} ${result.filledQuantity.toLocaleString('ko-KR')}주 체결`);
      await loadTradingData();
      await refreshUser();
    } catch (error) {
      setError(error instanceof Error ? error.message : '주문을 처리하지 못했습니다.');
    }
  };

  if (!user || !portfolio) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-2xl border border-[#dfe3ee] bg-white p-8 text-center shadow-card">
          <p className="text-xl font-black text-[#111827]">모의투자 계좌를 불러오는 중입니다.</p>
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
              <h1 className="text-sm font-black text-[#111827]">10억 모의투자 시스템</h1>
              <p className="mt-1 text-xs font-bold text-[#667085]">{user.nickname} · {user.provider}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" className="px-4 py-2 text-xs" onClick={() => navigate('/select')}>
              과거 시나리오
            </Button>
            <Button
              variant="ghost"
              className="px-4 py-2 text-xs"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              로그아웃
            </Button>
          </div>
        </header>
        <div className="grid gap-5 p-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-4">
              <Metric title="초기 자금" value={formatKRW(portfolio.seedMoney)} />
              <Metric title="총 자산" value={formatKRW(portfolio.totalAsset)} />
              <Metric title="예수금" value={formatKRW(portfolio.cash)} />
              <Metric title="수익률" value={formatRate(portfolio.profitRate)} tone={portfolio.profitRate >= 0 ? 'good' : 'bad'} />
            </div>
            <div className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black text-[#111827]">거래 가능 종목</h2>
                <span className="text-sm font-extrabold text-[#667085]">{stocks.length}개</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {stocks.map((stock) => (
                  <button
                    key={stock.id}
                    className={`rounded-2xl border p-4 text-left transition ${stock.id === selectedStock?.id ? 'border-[#5b45f2] bg-[#f8f7ff]' : 'border-[#edf0f6] bg-white hover:bg-[#fbfbfe]'}`}
                    onClick={() => setSelectedStockId(stock.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-[#8b95a7]">{stock.market} · {stock.id}</p>
                        <h3 className="mt-1 font-black text-[#111827]">{stock.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#111827]">{formatKRW(stock.currentPrice)}</p>
                        <p className={`mt-1 text-xs font-extrabold ${stock.changeRate >= 0 ? 'text-[#16a34a]' : 'text-[#ff3f55]'}`}>
                          {formatRate(stock.changeRate)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black text-[#111827]">보유 종목</h2>
                <span className="text-sm font-extrabold text-[#667085]">{portfolio.positions.length}개</span>
              </div>
              {portfolio.positions.length === 0 ? (
                <p className="rounded-xl bg-[#f7f8fc] p-6 text-center text-sm font-bold text-[#7b8496]">아직 보유한 종목이 없습니다.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="text-xs text-[#8b95a7]">
                      <tr>
                        <th className="py-3">종목</th>
                        <th>수량</th>
                        <th>평균가</th>
                        <th>평가금액</th>
                        <th>수익률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.positions.map((position) => (
                        <tr key={position.stockId} className="border-t border-[#edf0f6]">
                          <td className="py-3 font-extrabold text-[#111827]">{position.stockName}</td>
                          <td className="text-[#4b5563]">{position.quantity.toLocaleString('ko-KR')}주</td>
                          <td className="text-[#4b5563]">{formatKRW(position.averagePrice)}</td>
                          <td className="text-[#4b5563]">{formatKRW(position.evaluationAmount)}</td>
                          <td className={position.profitRate >= 0 ? 'font-black text-[#16a34a]' : 'font-black text-[#ff3f55]'}>
                            {formatRate(position.profitRate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
          <aside className="grid content-start gap-5">
            <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
              <h2 className="text-lg font-black text-[#111827]">시장가 주문</h2>
              {selectedStock && (
                <div className="mt-4 rounded-xl bg-[#f7f8fc] p-4">
                  <p className="text-xs font-bold text-[#8b95a7]">{selectedStock.id}</p>
                  <p className="mt-1 text-xl font-black text-[#111827]">{selectedStock.name}</p>
                  <p className="mt-2 font-extrabold text-[#5b45f2]">{formatKRW(selectedStock.currentPrice)}</p>
                </div>
              )}
              <input
                className="mt-4 w-full rounded-xl border border-[#dfe3ee] bg-white px-4 py-3 text-center font-extrabold text-[#111827] outline-none focus:border-[#5b45f2]"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button onClick={() => submitOrder('buy')}>매수</Button>
                <Button variant="danger" onClick={() => submitOrder('sell')}>매도</Button>
              </div>
              {message && <p className="mt-4 rounded-xl bg-[#effaf3] p-3 text-sm font-bold text-[#16a34a]">{message}</p>}
              {error && <p className="mt-4 rounded-xl bg-[#fff7f8] p-3 text-sm font-bold text-[#ff3f55]">{error}</p>}
            </section>
            <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
              <h2 className="mb-4 text-lg font-black text-[#111827]">랭킹</h2>
              <div className="grid gap-3">
                {rankings.slice(0, 5).map((item) => (
                  <div key={`${item.rank}-${item.nickname}`} className="flex items-center justify-between rounded-xl bg-[#f7f8fc] p-3">
                    <span className="text-sm font-black text-[#111827]">{item.rank}. {item.nickname}</span>
                    <span className={item.profitRate >= 0 ? 'text-sm font-black text-[#16a34a]' : 'text-sm font-black text-[#ff3f55]'}>
                      {formatRate(item.profitRate)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
              <h2 className="mb-4 text-lg font-black text-[#111827]">체결 내역</h2>
              {executions.length === 0 ? (
                <p className="rounded-xl bg-[#f7f8fc] p-5 text-center text-sm font-bold text-[#7b8496]">아직 체결된 주문이 없습니다.</p>
              ) : (
                <div className="grid max-h-80 gap-3 overflow-auto">
                  {executions.map((execution) => (
                    <div key={execution.id} className="rounded-xl border border-[#edf0f6] p-3">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-[#111827]">{execution.stockName}</strong>
                        <span className={execution.side === 'BUY' ? 'text-xs font-black text-[#5b45f2]' : 'text-xs font-black text-[#ff3f55]'}>
                          {execution.side === 'BUY' ? '매수' : '매도'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-bold text-[#667085]">
                        {execution.quantity.toLocaleString('ko-KR')}주 · {formatKRW(execution.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Metric({ title, value, tone = 'neutral' }: { title: string; value: string; tone?: 'good' | 'bad' | 'neutral' }) {
  const toneClass = {
    good: 'text-[#16a34a]',
    bad: 'text-[#ff3f55]',
    neutral: 'text-[#111827]',
  }[tone];

  return (
    <div className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
      <p className="text-xs font-extrabold text-[#667085]">{title}</p>
      <p className={`mt-2 text-xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
}
