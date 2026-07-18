import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/authorization";
import { validateClientInput } from "@/features/clients/client-input";
import { clientService } from "@/features/clients/client-service";

export const GET = async () => {
  const user = await getAuthenticatedUser();
  if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await clientService.list(user.id));
};

export const POST = async (request: NextRequest) => {
  const user = await getAuthenticatedUser();
  if (!user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = validateClientInput(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    return NextResponse.json(await clientService.create(user.id, parsed.data), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya existe un cliente con ese correo" }, { status: 409 });
  }
};
