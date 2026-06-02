import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { apiGet, apiPost } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { ExecutionItem, OrderResult, PortfolioSummary, RankingItem, StockItem } from '../types/trading';
import { formatCount, formatKRW, formatRate } from '../utils/format';

export function TradeDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const loginGuest = useAuthStore((state) => state.loginGuest);
  const logout = useAuthStore((state) => state.logout);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [selectedStockId, setSelectedStockId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedStock = useMemo(
    () => stocks.find((stock) => stock.id === selectedStockId) ?? stocks[0] ?? null,
    [selectedStockId, stocks],
  );
  const selectedPosition = portfolio?.positions.find((position) => position.stockId === selectedStock?.id) ?? null;

  useEffect(() => {
    if (!user) {
      refreshUser();
    }
  }, [refreshUser, user]);

  const loadDashboard = useCallback(async () => {
    const [stockItems, portfolioSummary, rankingItems, executionItems] = await Promise.all([
      apiGet<StockItem[]>('/stocks'),
      apiGet<PortfolioSummary>('/portfolio'),
      apiGet<RankingItem[]>('/rankings'),
      apiGet<ExecutionItem[]>('/executions'),
    ]);
    setStocks(stockItems);
    setPortfolio(portfolioSummary);
    setRankings(rankingItems);
    setExecutions(executionItems);
    setSelectedStockId((value) => value || stockItems[0]?.id || '');
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }
    loadDashboard().catch((error) => setMessage(error instanceof Error ? error.message : '대시보드를 불러오지 못했습니다.'));
    const timer = setInterval(loadDashboard, 5000);
    return () => clearInterval(timer);
  }, [loadDashboard, user]);

  const startGuest = async () => {
    setMessage('');
    await loginGuest();
    await refreshUser();
  };

  const buyStock = async () => {
    if (!selectedStock) {
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const result = await apiPost<OrderResult>('/orders/buy', { stockId: selectedStock.id, quantity });
      setMessage(`${selectedStock.name} ${formatCount(result.filledQuantity)} 매수 체결`);
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '매수 주문을 처리하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const sellStock = async () => {
    if (!selectedStock) {
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const result = await apiPost<OrderResult>('/orders/sell', { stockId: selectedStock.id, quantity });
      setMessage(`${selectedStock.name} ${formatCount(result.filledQuantity)} 매도 체결`);
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '매도 주문을 처리하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-5">
        <section className="w-full max-w-xl rounded-2xl border border-[#dfe3ee] bg-white p-7 text-center shadow-card">
          <BrandLogo />
          <h1 className="mt-8 text-3xl font-black text-[#111827]">모의투자 대시보드</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-[#667085]">Kakao 로그인 또는 게스트 세션으로 포트폴리오와 전체 랭킹을 확인할 수 있습니다.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button onClick={() => navigate('/login?next=/trade')}>로그인</Button>
            <Button variant="soft" onClick={startGuest}>게스트로 시작</Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-5">
      <section className="mx-auto max-w-7xl rounded-2xl border border-[#dfe3ee] bg-white shadow-card">
        <header className="flex flex-col gap-4 border-b border-[#edf0f6] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <BrandLogo />
            <div>
              <h1 className="text-xl font-black text-[#111827]">모의투자 대시보드</h1>
              <p className="mt-1 text-xs font-bold text-[#667085]">5초마다 포트폴리오와 랭킹을 갱신합니다.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#f4f2ff] px-4 py-2 text-xs font-extrabold text-[#5b45f2]">{user.nickname}님</span>
            <Button variant="ghost" className="px-4 py-2 text-xs" onClick={() => navigate('/mode-select')}>모드 선택</Button>
            <Button variant="ghost" className="px-4 py-2 text-xs" onClick={() => logout()}>로그아웃</Button>
          </div>
        </header>
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-5">
            <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-black text-[#111827]">전체 종목</h2>
                <span className="text-xs font-extrabold text-[#667085]">seed 가격 또는 KIS 현재가</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {stocks.map((stock) => (
                  <button
                    key={stock.id}
                    className={`rounded-xl border p-4 text-left transition ${selectedStock?.id === stock.id ? 'border-[#5b45f2] bg-[#f8f7ff]' : 'border-[#edf0f6] bg-white hover:border-[#c8cedd]'}`}
                    type="button"
                    onClick={() => setSelectedStockId(stock.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold text-[#8b95a7]">{stock.market} · {stock.id}</p>
                        <p className="mt-1 text-lg font-black text-[#111827]">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#111827]">{formatKRW(stock.currentPrice)}</p>
                        <p className={stock.changeRate >= 0 ? 'text-sm font-extrabold text-[#14a86b]' : 'text-sm font-extrabold text-[#ff3f55]'}>
                          {formatRate(stock.changeRate)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-black text-[#111827]">매매 기록</h2>
                <span className="text-xs font-extrabold text-[#667085]">{executions.length}건</span>
              </div>
              <div className="max-h-80 overflow-auto">
                {executions.length ? (
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs font-extrabold text-[#8b95a7]">
                      <tr>
                        <th className="py-2">종목</th>
                        <th className="py-2">구분</th>
                        <th className="py-2">수량</th>
                        <th className="py-2">금액</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold text-[#111827]">
                      {executions.map((execution) => (
                        <tr key={execution.id} className="border-t border-[#edf0f6]">
                          <td className="py-3">{execution.stockName}</td>
                          <td className={execution.side === 'BUY' ? 'py-3 text-[#5b45f2]' : 'py-3 text-[#ff3f55]'}>{execution.side === 'BUY' ? '매수' : '매도'}</td>
                          <td className="py-3">{formatCount(execution.quantity)}</td>
                          <td className="py-3">{formatKRW(execution.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="rounded-xl bg-[#f7f8fc] p-5 text-center text-sm font-bold text-[#667085]">아직 체결된 주문이 없습니다.</div>
                )}
              </div>
            </section>
          </div>
          <aside className="grid content-start gap-5">
            <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
              <h2 className="text-lg font-black text-[#111827]">내 포트폴리오</h2>
              <div className="mt-5 grid gap-3">
                <Metric label="총자산" value={formatKRW(portfolio?.totalAsset ?? user.seedMoney)} />
                <Metric label="현금" value={formatKRW(portfolio?.cash ?? user.cash)} />
                <Metric label="주식 평가금" value={formatKRW(portfolio?.stockValue ?? 0)} />
                <Metric label="수익률" value={formatRate(portfolio?.profitRate ?? 0)} />
              </div>
            </section>
            <section className="rounded-2xl border border-[#ded9ff] bg-[#f8f7ff] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black text-[#5b45f2]">주문</h2>
                <span className="text-xs font-extrabold text-[#5b45f2]">{selectedStock?.name ?? '종목 선택'}</span>
              </div>
              <input
                className="w-full rounded-xl border border-[#dfe3ee] bg-white px-4 py-3 text-center text-lg font-black text-[#111827] outline-none"
                min={1}
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button disabled={loading || !selectedStock} onClick={buyStock}>매수</Button>
                <Button variant="danger" disabled={loading || !selectedStock || !selectedPosition} onClick={sellStock}>매도</Button>
              </div>
              {message && <p className="mt-4 rounded-xl bg-white p-3 text-sm font-extrabold text-[#5b45f2]">{message}</p>}
            </section>
            <section className="rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-card">
              <h2 className="mb-4 text-lg font-black text-[#111827]">전체 랭킹</h2>
              <div className="grid gap-2">
                {rankings.slice(0, 5).map((item) => (
                  <div key={`${item.rank}-${item.nickname}`} className="flex items-center justify-between rounded-xl bg-[#f7f8fc] px-4 py-3">
                    <div>
                      <p className="text-xs font-extrabold text-[#8b95a7]">{item.rank}위</p>
                      <p className="font-black text-[#111827]">{item.nickname}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#111827]">{formatKRW(item.totalAsset)}</p>
                      <p className={item.profitRate >= 0 ? 'text-xs font-extrabold text-[#14a86b]' : 'text-xs font-extrabold text-[#ff3f55]'}>
                        {formatRate(item.profitRate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f7f8fc] p-4">
      <p className="text-xs font-extrabold text-[#8b95a7]">{label}</p>
      <p className="mt-2 text-xl font-black text-[#111827]">{value}</p>
    </div>
  );
}
