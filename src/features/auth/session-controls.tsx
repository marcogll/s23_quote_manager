"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Users } from "lucide-react";

export const SessionControls = () => {
  const { data: session } = useSession();

  return (
    <div className="session-controls">
      {session?.user?.role === "admin" && (
        <Link href="/admin/usuarios" className="session-control-link" aria-label="Usuarios" title="Usuarios">
          <Users size={17} />
        </Link>
      )}
      <button className="session-control-link" aria-label="Salir" title="Salir" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogOut size={17} />
      </button>
    </div>
  );
};
