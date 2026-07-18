import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/authorization";
import { quoteService } from "@/features/quotes/quote-service";
import { validateQuoteList } from "@/features/quotes/quote-input";

export const POST = async (request: NextRequest) => {
  const user = await getAuthenticatedUser();
  if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json() as { quotes?: unknown };
  const quotes = validateQuoteList(body.quotes);
  if (!quotes) return NextResponse.json({ error: "El archivo contiene cotizaciones inválidas" }, { status: 400 });
  return NextResponse.json(await quoteService.import(user.id, quotes));
};
