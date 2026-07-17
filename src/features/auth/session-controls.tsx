"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Users } from "lucide-react";

export const SessionControls = () => {
  const { data: session } = useSession();

  return (
    <div className="session-controls">
      {session?.user?.role === "admin" && (
        <Link href="/admin/usuarios" className="session-control-link">
          <Users size={15} /> Usuarios
        </Link>
      )}
      <button className="session-control-link" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogOut size={15} /> Salir
      </button>
    </div>
  );
};
