/**
 * Client-Side Currency Arithmetic & Formatting Utility
 */

export function toCents(amount: number | string | null | undefined): number {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return 0;
  return Math.round(Number(amount) * 100);
}

export function fromCents(cents: number | null | undefined): number {
  if (cents === null || cents === undefined || isNaN(Number(cents))) return 0;
  return Number((Math.round(Number(cents)) / 100).toFixed(2));
}

export function addCents(...values: (number | string | null | undefined)[]): number {
  return values.reduce((sum: number, v) => sum + (toCents(v) || 0), 0);
}

export function subtractCents(a: number | string, b: number | string): number {
  const diff = (toCents(a) || 0) - (toCents(b) || 0);
  return Math.max(0, diff);
}

export function formatCurrency(amountInDecimalOrCents: number | string, isCents = false): string {
  const cents = isCents ? Number(amountInDecimalOrCents) : toCents(amountInDecimalOrCents);
  const decimal = fromCents(cents);
  return `$${decimal.toFixed(2)}`;
}
