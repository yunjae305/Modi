export function formatKRW(n: number): string {
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

export function formatRate(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${(n * 100).toFixed(1)}%`;
}

export function formatCount(n: number): string {
  if (!Number.isFinite(n)) {
    return 'N/A';
  }
  return `${Math.round(n).toLocaleString('ko-KR')}주`;
}
