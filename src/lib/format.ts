export function formatNumber(value: number): string {
  return value.toLocaleString();
}

let _currency = "GBP";
const LOCALE_MAP: Record<string, string> = { GBP: "en-GB", USD: "en-US", EUR: "en-IE" };

export function setCurrency(code: string) { _currency = code; }
export function getCurrency(): string { return _currency; }

export function formatCurrency(value: number, currency?: string): string {
  const cur = currency || _currency;
  return new Intl.NumberFormat(LOCALE_MAP[cur] || "en-GB", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, precision?: number): string {
  const decimals = precision ?? (value > 0 && value < 0.1 ? 2 : 1);
  return `${value.toFixed(decimals)}%`;
}
