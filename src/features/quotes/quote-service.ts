import { quoteRepository } from "@/features/quotes/quote-repository";
import type { StoredQuote } from "@/features/quotes/quote-history-dialog";

export const quoteService = {
  list: (userId: string) => quoteRepository.list(userId),
  save: async (userId: string, quote: StoredQuote) => {
    await quoteRepository.upsert(userId, quote);
    return quote;
  },
  import: async (userId: string, quotes: StoredQuote[]) => {
    await Promise.all(quotes.map((quote) => quoteRepository.upsert(userId, quote)));
    return quoteRepository.list(userId);
  },
  remove: async (userId: string, quoteKey: string) => (await quoteRepository.remove(userId, quoteKey)).count > 0,
};
