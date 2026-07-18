import type { StoredQuote } from "@/features/quotes/quote-history-dialog";

export const isStoredQuote = (value: unknown): value is StoredQuote => {
  if (!value || typeof value !== "object") return false;
  const quote = value as Record<string, unknown>;
  const client = quote.client as Record<string, unknown> | undefined;
  return typeof quote.id === "string"
    && typeof quote.number === "string"
    && typeof quote.updatedAt === "string"
    && Boolean(client && typeof client.name === "string")
    && Array.isArray(quote.lines)
    && typeof quote.notes === "string"
    && typeof quote.discountId === "string"
    && typeof quote.referral === "boolean"
    && ["MXN", "USD", "CAD", "EUR"].includes(String(quote.currency));
};

export const validateQuoteList = (value: unknown): StoredQuote[] | null => {
  if (!Array.isArray(value) || !value.every(isStoredQuote)) return null;
  return value;
};
