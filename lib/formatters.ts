import { toCents, fromCents } from "./money";

/**
 * Format currency decimal or cents into standard "Rs. XX.XX" string
 */
export function formatPrice(amountInDecimalOrCents: number | string, isCents = false): string {
  const cents = isCents ? Number(amountInDecimalOrCents) : toCents(amountInDecimalOrCents);
  const decimal = fromCents(cents);
  return `$${decimal.toFixed(2)}`;
}

/**
 * Format ISO date string into human-readable formatted string
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}
