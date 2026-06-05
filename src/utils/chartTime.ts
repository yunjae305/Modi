export function getChartDate(date: string): string {
  const [firstDate] = date.split('~');
  return firstDate.trim();
}
