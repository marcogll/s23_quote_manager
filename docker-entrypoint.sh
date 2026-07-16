#!/bin/sh
set -e

echo "============================================================"
echo "  Soul:23 Product Editor - Entrypoint"
echo "============================================================"

# Verificar que DATABASE_URL este definida
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL no esta definida"
  exit 1
fi

echo "Esperando base de datos..."
# Extraer host de DATABASE_URL para healthcheck simple
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_PORT=${DB_PORT:-5432}

until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  echo "  - Base de datos no disponible en ${DB_HOST}:${DB_PORT}, esperando..."
  sleep 2
done

echo "Base de datos lista."

# Ejecutar migraciones de Prisma
echo ""
echo "Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

echo ""
echo "Migraciones completadas."

# Iniciar aplicacion
echo ""
echo "Iniciando aplicacion Next.js..."
echo "============================================================"
exec "$@"
