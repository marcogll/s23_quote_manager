import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/authorization";
import { validateClientInput } from "@/features/clients/client-input";
import { clientService } from "@/features/clients/client-service";

type RouteContext = { params: Promise<{ id: string }> };

export const PUT = async (request: NextRequest, { params }: RouteContext) => {
  const user = await getAuthenticatedUser();
  if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = validateClientInput(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const client = await clientService.update((await params).id, user.id, parsed.data);
    if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Ya existe un cliente con ese correo" }, { status: 409 });
  }
};

export const DELETE = async (_request: NextRequest, { params }: RouteContext) => {
  const user = await getAuthenticatedUser();
  if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const removed = await clientService.remove((await params).id, user.id);
  if (!removed) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  return NextResponse.json({ message: "Cliente eliminado" });
};
