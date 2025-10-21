export function formatAnnualRent(value: number | null, label: string): string | null {
  if (value === null) return null;
  const formatter = new Intl.NumberFormat("ko-KR");
  return `${label} ${formatter.format(Math.round(value))}만원`;
}
