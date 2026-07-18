import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/authorization";
import { quoteService } from "@/features/quotes/quote-service";

type RouteContext = { params: Promise<{ id: string }> };

export const DELETE = async (_request: Request, { params }: RouteContext) => {
  const user = await getAuthenticatedUser();
  if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const removed = await quoteService.remove(user.id, (await params).id);
  return NextResponse.json({ removed });
};
