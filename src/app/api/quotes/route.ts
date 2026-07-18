import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/authorization";
import { isStoredQuote } from "@/features/quotes/quote-input";
import { quoteService } from "@/features/quotes/quote-service";

export const GET = async () => {
  const user = await getAuthenticatedUser();
  if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await quoteService.list(user.id));
};

export const POST = async (request: NextRequest) => {
  const user = await getAuthenticatedUser();
  if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const quote = await request.json() as unknown;
  if (!isStoredQuote(quote)) return NextResponse.json({ error: "Cotización inválida" }, { status: 400 });
  return NextResponse.json(await quoteService.save(user.id, quote));
};
