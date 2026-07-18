import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export const GET = async () => {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
};
