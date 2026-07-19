"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell" aria-labelledby="login-title">
        <div className="login-brand-panel">
          <img
            src="/soul23_logo.svg"
            alt="Soul:23"
          />
          <div>
            <p className="login-eyebrow">Marketing &amp; Systems</p>
            <h1>Tu operación comercial, en un solo lugar.</h1>
            <p className="login-intro">
              Crea cotizaciones, administra clientes y mantén el seguimiento de cada oportunidad.
            </p>
          </div>
          <p className="login-brand-footer">Soul:23 · Sistema de cotizaciones</p>
        </div>

        <div className="login-form-panel">
          <div className="login-heading">
            <img className="login-mark" src="/soul23_logo.svg" alt="Soul:23" />
            <p className="login-eyebrow">Acceso seguro</p>
            <h2 id="login-title">Bienvenido</h2>
            <p>Ingresa tus credenciales para continuar.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <label className="login-field" htmlFor="email">
            <span>Usuario o correo</span>
            <span className="login-input-wrap">
              <UserRound size={18} aria-hidden="true" />
              <input
                id="email"
                name="email"
                type="text"
                required
                autoCapitalize="none"
                autoComplete="username"
                placeholder="Usuario o correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </span>
          </label>

          <label className="login-field" htmlFor="password">
            <span>Contraseña</span>
            <span className="login-input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="login-submit"
          >
            <span>{loading ? "Verificando…" : "Iniciar sesión"}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

          <p className="login-help">Acceso exclusivo para el equipo Soul:23.</p>
        </div>
      </section>
    </main>
  );
}
