import type { StoredQuote } from "@/features/quotes/quote-history-dialog";

const read = async <T,>(response: Response): Promise<T> => {
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "No fue posible guardar las cotizaciones");
  return data;
};

export const quoteApi = {
  list: async () => read<StoredQuote[]>(await fetch("/api/quotes", { cache: "no-store" })),
  save: async (quote: StoredQuote) => read<StoredQuote>(await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(quote) })),
  import: async (quotes: StoredQuote[]) => read<StoredQuote[]>(await fetch("/api/quotes/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quotes }) })),
  remove: async (id: string) => read<{ removed: boolean }>(await fetch(`/api/quotes/${encodeURIComponent(id)}`, { method: "DELETE" })),
};
