// Modi 수익 비교 차트 컴포넌트
import { useEffect, useRef } from 'react';
import { createChart, LineStyle, type LineData, type Time } from 'lightweight-charts';
import { getChartDate } from '../../utils/chartTime';
import { formatKRW } from '../../utils/format';

interface ProfitChartProps {
  series: { date: string; myValue: number; holdValue: number }[];
}

// 포트폴리오 수익 비교 차트 컴포넌트
export function ProfitChart({ series }: ProfitChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const chart = createChart(container, {
      height: 320,
      width: container.clientWidth,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#8b95a7',
      },
      grid: {
        vertLines: { color: '#eef1f7' },
        horzLines: { color: '#eef1f7' },
      },
      rightPriceScale: {
        borderColor: '#e4e8f0',
      },
      timeScale: {
        borderColor: '#e4e8f0',
      },
      localization: {
        priceFormatter: (price: number) => formatKRW(price),
      },
    });
    const mySeries = chart.addLineSeries({
      color: '#5b45f2',
      lineWidth: 3,
    });
    const holdSeries = chart.addLineSeries({
      color: '#b5bdcc',
      lineWidth: 2,
      lineStyle: LineStyle.Dotted,
    });
    const myData: LineData<Time>[] = series.map((point) => ({
      time: getChartDate(point.date) as Time,
      value: point.myValue,
    }));
    const holdData: LineData<Time>[] = series.map((point) => ({
      time: getChartDate(point.date) as Time,
      value: point.holdValue,
    }));
    // 내 포트폴리오와 존버 기준선
    mySeries.setData(myData);
    holdSeries.setData(holdData);
    chart.timeScale().fitContent();
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // 차트 캔버스 폭 보정
        chart.applyOptions({ width: Math.round(entry.contentRect.width) });
      }
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [series]);

  return (
    <section className="rounded-3xl border border-[#dfe3ee] bg-white p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <h2 className="text-lg font-black text-[#111827]">수익률 비교</h2>
        <span className="flex items-center gap-2 text-xs font-bold text-[#5b45f2]">
          <i className="h-1 w-6 rounded-full bg-[#5b45f2]" />
          내 포트폴리오
        </span>
        <span className="flex items-center gap-2 text-xs font-bold text-[#6b7280]">
          <i className="h-1 w-6 rounded-full border-t-2 border-dotted border-[#aab2c2]" />
          존버 전략
        </span>
      </div>
      <div ref={containerRef} className="h-[430px] w-full" />
    </section>
  );
}
