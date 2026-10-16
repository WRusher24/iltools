// Hebrew number/date formatting helpers. Output should be wrapped in <bdi> by UI components.
const ils = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });
const ils2 = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat('he-IL', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const NA = 'לא זמין';

export function formatILS(n: number | null | undefined, decimals = false): string {
  if (n == null || Number.isNaN(n)) return NA;
  return (decimals ? ils2 : ils).format(n);
}
export function formatNumber(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return NA;
  return num.format(n);
}
export function formatPct(ratio: number | null | undefined): string {
  if (ratio == null || Number.isNaN(ratio)) return NA;
  return pct.format(ratio);
}
/** ISO date (YYYY-MM-DD) → "16 באוקטובר 2026". */
export function formatDateHe(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}
