import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { StoredQuote } from "@/features/quotes/quote-history-dialog";

const payload = (quote: StoredQuote): Prisma.InputJsonValue => quote as unknown as Prisma.InputJsonValue;

export const quoteRepository = {
  list: async (userId: string): Promise<StoredQuote[]> => {
    const rows = await prisma.quote.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
    return rows.map((row) => row.payload as unknown as StoredQuote);
  },
  upsert: (userId: string, quote: StoredQuote) => prisma.quote.upsert({
    where: { userId_quoteKey: { userId, quoteKey: quote.id } },
    create: { userId, quoteKey: quote.id, number: quote.number, payload: payload(quote) },
    update: { number: quote.number, payload: payload(quote) },
  }),
  remove: (userId: string, quoteKey: string) => prisma.quote.deleteMany({ where: { userId, quoteKey } }),
};
