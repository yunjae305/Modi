import { useEffect, useMemo, useRef, useState } from 'react';
import { CrosshairMode, createChart, type CandlestickData, type Time } from 'lightweight-charts';
import type { OHLCVBar } from '../../types';
import { ChartTooltip } from './ChartTooltip';

interface CandleChartProps {
  data: OHLCVBar[];
  visibleCount: number;
  isTutorial?: boolean;
  height?: number;
}

export function CandleChart({ data, visibleCount, isTutorial = false, height = 420 }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ bar: OHLCVBar | null; x: number; y: number }>({
    bar: null,
    x: 0,
    y: 0,
  });
  const visibleData = useMemo(() => data.slice(0, Math.max(1, visibleCount)), [data, visibleCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const chart = createChart(container, {
      height: container.clientHeight || height,
      width: container.clientWidth,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#8b95a7',
      },
      grid: {
        vertLines: { color: '#eef1f7' },
        horzLines: { color: '#eef1f7' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#e4e8f0',
      },
      timeScale: {
        borderColor: '#e4e8f0',
        timeVisible: true,
      },
    });
    const series = chart.addCandlestickSeries({
      upColor: '#5b45f2',
      downColor: '#ff3f55',
      borderUpColor: '#5b45f2',
      borderDownColor: '#ff3f55',
      wickUpColor: '#5b45f2',
      wickDownColor: '#ff3f55',
    });
    const chartData: CandlestickData<Time>[] = visibleData.map((bar) => ({
      time: bar.date as Time,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));
    series.setData(chartData);
    chart.timeScale().fitContent();
    if (isTutorial) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0) {
          setTooltip({ bar: null, x: 0, y: 0 });
          return;
        }
        const rect = container.getBoundingClientRect();
        const bar = visibleData.find((item) => item.date === String(param.time)) ?? null;
        setTooltip({
          bar,
          x: rect.left + param.point.x + 16,
          y: rect.top + param.point.y + 16,
        });
      });
    }
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        chart.applyOptions({ width: Math.round(entry.contentRect.width) });
      }
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [height, isTutorial, visibleData]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#dfe3ee] bg-white shadow-card" style={{ height }}>
      <div ref={containerRef} className="h-full w-full" />
      {isTutorial && <ChartTooltip {...tooltip} />}
    </div>
  );
}
