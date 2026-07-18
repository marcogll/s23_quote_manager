import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/authorization";
import { validateClientInput, type ClientInput } from "@/features/clients/client-input";
import { clientService } from "@/features/clients/client-service";

export const GET = async () => {
  const user = await getAuthenticatedUser();
  if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  return NextResponse.json({ clients: await clientService.list(user.id) });
};

export const POST = async (request: NextRequest) => {
  const user = await getAuthenticatedUser();
  if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json() as { clients?: unknown };
  if (!Array.isArray(body.clients)) {
    return NextResponse.json({ error: "El respaldo no contiene una lista de clientes válida" }, { status: 400 });
  }

  const clients: ClientInput[] = [];
  for (const value of body.clients) {
    const parsed = validateClientInput(value);
    if (!parsed.success) return NextResponse.json({ error: `Cliente inválido: ${parsed.error}` }, { status: 400 });
    clients.push(parsed.data);
  }

  try {
    await clientService.replaceAll(user.id, clients);
    return NextResponse.json({ restoredClients: clients.length });
  } catch {
    return NextResponse.json({ error: "No fue posible restaurar los clientes; revisa correos duplicados" }, { status: 409 });
  }
};
