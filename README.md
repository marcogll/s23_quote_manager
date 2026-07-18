<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/marcogll/mg_data_storage/refs/heads/main/soul23/logo/soul23_logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/marcogll/mg_data_storage/refs/heads/main/soul23/logo/soul23_logo.svg">
    <img src="https://raw.githubusercontent.com/marcogll/mg_data_storage/refs/heads/main/soul23/logo/soul23_logo.svg" width="110" alt="Soul:23 Product Editor">
  </picture>
</p>

<h1 align="center">Soul:23 Product Editor</h1>

<p align="center">
  Gestor de cotizaciones con autenticacion, PostgreSQL y despliegue containerizado para Coolify.
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
- Cotizaciones persistentes por usuario, con importacion y exportacion JSON
- Docker Compose listo para Coolify en un VPS
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
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build

# O en segundo plano
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Servicios expuestos:
- Aplicacion: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Despliegue en Coolify

1. Crear un recurso desde el repositorio Git y seleccionar **Docker Compose**.
2. Indicar `docker-compose.coolify.yml` como archivo Compose.
3. Configurar estas variables en Coolify:
   - `POSTGRES_PASSWORD`: contraseña aleatoria y larga.
   - `NEXTAUTH_SECRET`: generar con `openssl rand -base64 32`.
   - `APP_URL`: dominio completo, por ejemplo `https://cotizaciones.example.com`.
   - Opcionalmente `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `ADMIN_NAME`.
   Se puede copiar la plantilla `.env.coolify.example` en **Environment
   Variables > Developer View** y reemplazar todos sus valores de ejemplo.
4. Asignar el dominio al servicio `app` y al puerto `3000`.
5. Desplegar. El contenedor espera PostgreSQL, aplica migraciones y después
   inicia Next.js. El healthcheck disponible es `/api/health`.
6. En la base PostgreSQL de Coolify, configurar respaldos programados hacia un
   almacenamiento S3 compatible. El volumen `postgres_data` conserva los datos
   entre deployments, pero no sustituye un respaldo externo.

Las cotizaciones guardadas anteriormente en `localStorage` se importan una vez
a PostgreSQL al iniciar sesión. Después se consultan siempre desde la base de
datos y pueden exportarse o importarse desde la sección Cotizaciones.

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
docker-compose.yml         # Produccion y archivo predeterminado de Coolify
docker-compose.local.yml   # Puertos adicionales para desarrollo local
docker-compose.coolify.yml # Stack de produccion para Coolify
```

## Variables de entorno

| Variable         | Descripcion                                        |
|------------------|----------------------------------------------------|
| DATABASE_URL     | URL de conexion a PostgreSQL                       |
| NEXTAUTH_URL     | URL publica HTTPS de la aplicacion                 |
| NEXTAUTH_SECRET  | Clave secreta para firmar tokens de sesion         |
| ADMIN_EMAIL      | Correo del administrador inicial (opcional)        |
| ADMIN_USERNAME   | Usuario del administrador inicial (opcional)       |
| ADMIN_PASSWORD   | Contraseña segura del administrador (opcional)     |
| ADMIN_NAME       | Nombre visible del administrador (opcional)        |

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
