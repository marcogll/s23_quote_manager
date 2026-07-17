import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/authorization";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { error: "No tienes permiso para crear usuarios" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, username } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Usuario, email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim().toLowerCase();

    if (!/^[a-z0-9._-]{3,32}$/.test(normalizedUsername)) {
      return NextResponse.json(
        { error: "El usuario debe tener entre 3 y 32 caracteres válidos" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "El nombre de usuario ya existe" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        name: typeof name === "string" ? name.trim() || null : null,
        password: hashedPassword,
        role: "user",
      },
    });

    return NextResponse.json(
      { message: "Usuario creado", user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user");
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
