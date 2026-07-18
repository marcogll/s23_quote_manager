#!/bin/sh
set -e

echo "============================================================"
echo "  Soul:23 Product Editor - Entrypoint"
echo "============================================================"

# Verificar que DATABASE_URL este definida
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL no esta definida"
  echo ""
  echo "Configura DATABASE_URL antes de iniciar la aplicacion."
  echo ""
  echo "Iniciando aplicacion de todos modos..."
  echo "============================================================"
  exec "$@"
fi

echo "DATABASE_URL detectada."
echo "Esperando base de datos..."

# Extraer host de DATABASE_URL para healthcheck simple
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_PORT=${DB_PORT:-5432}

# Esperar maximo 30 segundos por la base de datos
RETRIES=0
MAX_RETRIES=15

until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  RETRIES=$((RETRIES + 1))
  if [ $RETRIES -ge $MAX_RETRIES ]; then
    echo "WARNING: No se pudo conectar a la base de datos despues de 30s"
    echo "Iniciando aplicacion sin migraciones..."
    echo "============================================================"
    exec "$@"
  fi
  echo "  - Base de datos no disponible en ${DB_HOST}:${DB_PORT}, esperando... (${RETRIES}/${MAX_RETRIES})"
  sleep 2
done

echo "Base de datos lista."

# Ejecutar migraciones de Prisma
echo ""
echo "Ejecutando migraciones de Prisma..."
npx prisma migrate deploy
echo ""
echo "Migraciones completadas exitosamente."

# Sincronizar administrador inicial
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_USERNAME" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo ""
  echo "Sincronizando administrador..."
  node scripts/bootstrap-admin.mjs
else
  echo ""
  echo "Variables de administrador no configuradas. Omitiendo bootstrap."
fi

# Iniciar aplicacion
echo ""
echo "Iniciando aplicacion Next.js..."
echo "============================================================"
exec "$@"
