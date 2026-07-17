#!/bin/sh
set -e

echo "============================================================"
echo "  Soul:23 Product Editor - Entrypoint"
echo "============================================================"

# Detectar si usamos PostgreSQL embebido o externo
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')

if [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
  echo "Modo: PostgreSQL embebido"
  echo "Iniciando PostgreSQL..."

  # Asegurar permisos correctos
  chown -R postgres:postgres /var/lib/postgresql/data /run/postgresql

  # Iniciar PostgreSQL en background como usuario postgres
  su - postgres -c "pg_ctl -D /var/lib/postgresql/data -l /var/lib/postgresql/logfile start"

  # Esperar a que PostgreSQL esté listo (máximo 30 segundos)
  RETRIES=0
  MAX_RETRIES=15
  until nc -z 127.0.0.1 5432 2>/dev/null; do
    RETRIES=$((RETRIES + 1))
    if [ $RETRIES -ge $MAX_RETRIES ]; then
      echo "ERROR: PostgreSQL no inició después de 30s"
      echo "Revisando logs de PostgreSQL:"
      cat /var/lib/postgresql/logfile || true
      exit 1
    fi
    echo "  - Esperando PostgreSQL... (${RETRIES}/${MAX_RETRIES})"
    sleep 2
  done

  echo "PostgreSQL listo en 127.0.0.1:5432"

  # Crear base de datos si no existe
  if ! su - postgres -c "psql -lqt" | grep -qw "$PGDATABASE"; then
    echo "Creando base de datos: $PGDATABASE"
    su - postgres -c "createdb $PGDATABASE"
  else
    echo "Base de datos '$PGDATABASE' ya existe"
  fi

else
  echo "Modo: PostgreSQL externo"
  echo "DATABASE_URL detectada."
  echo "Esperando base de datos externa..."

  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  DB_PORT=${DB_PORT:-5432}

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

  echo "Base de datos externa lista."
fi

# Ejecutar migraciones de Prisma
echo ""
echo "Ejecutando migraciones de Prisma..."
if npx prisma migrate deploy; then
  echo ""
  echo "Migraciones completadas exitosamente."
else
  echo ""
  echo "WARNING: Las migraciones fallaron. La base de datos puede no estar sincronizada."
fi

# Crear o actualizar el administrador configurado.
echo ""
echo "Sincronizando administrador inicial..."
node scripts/bootstrap-admin.mjs

# Iniciar aplicacion (CMD se encarga de bajar privilegios con su-exec)
echo ""
echo "Iniciando aplicacion Next.js..."
echo "============================================================"
exec "$@"
