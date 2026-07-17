# Multi-stage build for Next.js app with embedded PostgreSQL
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npm install -g pnpm && pnpm prisma generate

# Build the application
RUN pnpm build

# Production image with embedded PostgreSQL
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install PostgreSQL 15, client tools, and netcat
RUN apk add --no-cache postgresql15 postgresql15-client netcat-openbsd su-exec
RUN npm install -g pnpm

# Create system user for Next.js
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Initialize PostgreSQL data directory
RUN mkdir -p /var/lib/postgresql/data /run/postgresql \
    && chown -R postgres:postgres /var/lib/postgresql /run/postgresql \
    && su - postgres -c "initdb -D /var/lib/postgresql/data"

# Configure PostgreSQL to accept local connections without password
RUN echo "host all all 127.0.0.1/32 trust" >> /var/lib/postgresql/data/pg_hba.conf \
    && echo "host all all ::1/128 trust" >> /var/lib/postgresql/data/pg_hba.conf \
    && echo "listen_addresses = '127.0.0.1'" >> /var/lib/postgresql/data/postgresql.conf

# Copy application files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/scripts ./scripts

# Copy and set up entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set correct permissions for app
RUN chown -R nextjs:nodejs /app

# Default database settings (used when DATABASE_URL is not provided externally)
ENV PGDATA=/var/lib/postgresql/data
ENV PGUSER=postgres
ENV PGDATABASE=soul23_products
ENV DATABASE_URL="postgresql://postgres@localhost:5432/soul23_products?schema=public"

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Entrypoint must run as root to start PostgreSQL, then drop privileges for the app
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["su-exec", "nextjs:nodejs", "node", "server.js"]
