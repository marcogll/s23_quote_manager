import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const normalized = String(identifier).trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalized }, { username: normalized }],
      },
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: `No se encontró usuario con email/username: ${normalized}`,
      });
    }

    const userPassword = user.password ?? "";
    const isValid = userPassword
      ? await bcrypt.compare(password, userPassword)
      : false;

    return NextResponse.json({
      exists: true,
      hasPassword: !!userPassword,
      passwordValid: isValid,
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      passwordHashPrefix: user.password?.slice(0, 20) + "...",
    });
  } catch (error) {
    console.error("[DEBUG AUTH] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
