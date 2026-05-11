import type { OHLCVBar } from '../../types';
import { formatKRW } from '../../utils/format';

interface ChartTooltipProps {
  bar: OHLCVBar | null;
  x: number;
  y: number;
}

export function ChartTooltip({ bar, x, y }: ChartTooltipProps) {
  if (!bar) {
    return null;
  }
  return (
    <div
      className="pointer-events-none fixed z-40 w-48 rounded-xl border border-[#dfe3ee] bg-white p-4 text-xs text-[#111827] shadow-card"
      style={{ left: x, top: y }}
    >
      <p className="mb-2 font-extrabold text-[#111827]">{bar.date}</p>
      <div className="grid grid-cols-2 gap-2">
        <span className="text-[#6b7280]">시가</span>
        <span className="text-right">{formatKRW(bar.open)}</span>
        <span className="text-[#6b7280]">고가</span>
        <span className="text-right text-[#16a34a]">{formatKRW(bar.high)}</span>
        <span className="text-[#6b7280]">저가</span>
        <span className="text-right text-[#ff3f55]">{formatKRW(bar.low)}</span>
        <span className="text-[#6b7280]">종가</span>
        <span className="text-right">{formatKRW(bar.close)}</span>
      </div>
    </div>
  );
}
