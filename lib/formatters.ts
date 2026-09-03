import { toCents, fromCents } from "./money";

/**
 * Extracts a clean symbol from any currency string
 * (e.g. "USD ($)" -> "$", "EUR (€)" -> "€", "PKR (Rs.)" -> "Rs. ", "Rs." -> "Rs. ", "$" -> "$")
 */
export function getCurrencySymbol(rawCurrency?: string | null): string {
  if (!rawCurrency) return "$";
  const s = rawCurrency.trim();
  if (s.includes("$")) return "$";
  if (s.includes("£")) return "£";
  if (s.includes("€")) return "€";
  if (s.toLowerCase().includes("rs") || s.toLowerCase().includes("pkr")) return "Rs. ";
  if (s.toUpperCase().includes("AED")) return "AED ";
  if (s.toUpperCase().includes("SAR")) return "SAR ";
  if (s.toUpperCase().includes("CAD")) return "CA$";
  return s.endsWith(" ") ? s : `${s} `;
}

/**
 * Format currency decimal or cents into standard string
 */
export function formatPrice(
  amountInDecimalOrCents: number | string,
  isCents = false,
  rawCurrency = "$"
): string {
  const cents = isCents ? Number(amountInDecimalOrCents) : toCents(amountInDecimalOrCents);
  const decimal = fromCents(cents);
  const symbol = getCurrencySymbol(rawCurrency);
  return `${symbol}${decimal.toFixed(2)}`;
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
