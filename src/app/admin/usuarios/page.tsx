"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { FormEvent, useCallback, useEffect, useState } from "react";

type UserSummary = {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  role: string;
  createdAt: string;
};

const emptyForm = { name: "", username: "", email: "", password: "" };

export default function UsersAdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/users");
    if (!response.ok) {
      setError("No fue posible cargar los usuarios.");
      setLoading(false);
      return;
    }
    setUsers(await response.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const createUser = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "No fue posible crear el usuario.");
      setSaving(false);
      return;
    }

    setForm(emptyForm);
    setSuccess(`Usuario ${payload.user.email} creado correctamente.`);
    await loadUsers();
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">Administración</p>
            <h1 className="text-2xl font-bold">Usuarios</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">{session?.user?.email}</span>
            <Link href="/" className="rounded-md border px-3 py-2 hover:bg-gray-50">Cotizaciones</Link>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-gray-700">Salir</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[360px_1fr]">
        <section className="h-fit rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Crear usuario</h2>
          <p className="mt-1 text-sm text-gray-500">La cuenta podrá iniciar sesión en cotizaciones.</p>
          <form onSubmit={createUser} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">Nombre
              <input className="mt-1 w-full rounded-md border px-3 py-2 font-normal" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nombre del usuario" />
            </label>
            <label className="block text-sm font-medium">Correo
              <input className="mt-1 w-full rounded-md border px-3 py-2 font-normal" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="usuario@empresa.com" />
            </label>
            <label className="block text-sm font-medium">Usuario
              <input className="mt-1 w-full rounded-md border px-3 py-2 font-normal" required minLength={3} maxLength={32} pattern="[A-Za-z0-9._-]+" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="nombre.usuario" autoCapitalize="none" />
            </label>
            <label className="block text-sm font-medium">Contraseña temporal
              <input className="mt-1 w-full rounded-md border px-3 py-2 font-normal" type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            </label>
            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</p>}
            <button disabled={saving} className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Creando…" : "Crear usuario"}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold">Cuentas registradas</h2>
            <p className="text-sm text-gray-500">{users.length} {users.length === 1 ? "usuario" : "usuarios"}</p>
          </div>
          {loading ? <p className="p-6 text-gray-500">Cargando…</p> : (
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.name || "Sin nombre"}</p>
                    <p className="truncate text-sm text-gray-500">@{user.username || "sin-usuario"} · {user.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.role === "admin" ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                    {user.role === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
