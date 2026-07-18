import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers";

export const metadata: Metadata = {
  title: "Cotizaciones · Soul:23",
  description: "Cotizaciones y gestión de clientes",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
