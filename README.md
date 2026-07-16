<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/marcogll/mg_data_storage/refs/heads/main/soul23/logo/soul23_logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/marcogll/mg_data_storage/refs/heads/main/soul23/logo/soul23_logo.svg">
    <img src="https://raw.githubusercontent.com/marcogll/mg_data_storage/refs/heads/main/soul23/logo/soul23_logo.svg" width="110" alt="Soul:23 Product Editor">
  </picture>
</p>

<h1 align="center">Soul:23 Product Editor</h1>

<p align="center">
  Editor de productos con autenticacion, base de datos PostgreSQL y despliegue containerizado para Railway.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-3a3a3a?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-3a3a3a?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3a3a3a?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/PostgreSQL-3a3a3a?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-3a3a3a?style=flat-square&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/Docker-3a3a3a?style=flat-square&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/NextAuth-3a3a3a?style=flat-square&logo=nextauth&logoColor=white" alt="NextAuth.js">
</p>

---

## Caracteristicas

- CRUD completo de productos (nombre, descripcion, precio, SKU, categoria, stock, imagen)
- Autenticacion con credenciales via NextAuth.js
- Middleware de proteccion de rutas
- Base de datos PostgreSQL con Prisma ORM
- Generacion de cliente Prisma autonoma
- Docker y Docker Compose para despliegue en Railway
- PWA lista para instalacion

## Requisitos

- Node.js 20+
- pnpm (o npm)
- Docker y Docker Compose (opcional, para entornos containerizados)

## Instalacion local

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
# Crear archivo .env con:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/soul23_products?schema=public"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="tu-clave-secreta"

# Iniciar PostgreSQL (via Docker Compose)
docker-compose up -d db

# Ejecutar migraciones de Prisma
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Iniciar servidor de desarrollo
pnpm dev
```

La aplicacion estara disponible en `http://localhost:3000`.

## Uso con Docker

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# O en segundo plano
docker-compose up -d --build
```

Servicios expuestos:
- Aplicacion: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Despliegue en Railway

1. Conectar el repositorio a Railway
2. Configurar variables de entorno:
   - `DATABASE_URL` (Railway genera esto automaticamente al agregar PostgreSQL)
   - `NEXTAUTH_SECRET` (generar con `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (dominio asignado por Railway)
3. Railway detectara automaticamente el `Dockerfile` y `docker-compose.yml`

## Estructura del proyecto

```
prisma/
  schema.prisma          # Modelos de Product, User, Account, Session
  migrations/            # Migraciones de base de datos
src/
  app/
    api/
      auth/[...nextauth]/  # Endpoint de NextAuth
      products/            # API CRUD de productos
      register/            # Endpoint de registro de usuarios
    login/                 # Pagina de inicio de sesion
    productos/             # Editor de productos (protegido)
    register/              # Registro de usuario inicial
  lib/
    auth.ts                # Configuracion de NextAuth
    prisma.ts              # Cliente Prisma con adaptador PostgreSQL
Dockerfile                 # Build multi-stage para produccion
docker-compose.yml         # Servicios app + PostgreSQL
```

## Variables de entorno

| Variable         | Descripcion                                      |
|------------------|--------------------------------------------------|
| DATABASE_URL     | URL de conexion a PostgreSQL                     |
| NEXTAUTH_URL     | URL base de la aplicacion                        |
| NEXTAUTH_SECRET  | Clave secreta para firmar tokens de sesion       |

## Comandos utiles

```bash
# Generar cliente Prisma despues de cambios en schema
npx prisma generate

# Nueva migracion
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos
npx prisma migrate reset

# Studio de Prisma (UI de base de datos)
npx prisma studio
```

## Stack tecnologico

- Next.js 15 (App Router)
- React 19
- TypeScript 5.7
- Tailwind CSS 4
- Prisma 7 con PostgreSQL
- NextAuth.js 4 (autenticacion)
- bcryptjs (hashing de passwords)
- Docker / Docker Compose
- PWA (next-pwa)

