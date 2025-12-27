import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// convert prisma object into a regular JS object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatCurrency(amountInCents: number, currency: string) {
  const normalizedCurrency =
    typeof currency === "string" && currency.length > 0
      ? currency.toUpperCase()
      : "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalizedCurrency,
  }).format(amountInCents / 100);
}

/**
 * Format a YYYY-MM month string to a human-readable label
 * Example: "2024-01" -> "Jan 2024"
 */
export function formatMonthLabel(monthYear: string) {
  const [year, month] = monthYear.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Milliseconds in a day - useful for date calculations
 */
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
