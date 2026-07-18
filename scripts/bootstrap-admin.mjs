import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Marco";

if (!email && !password) {
  console.log("Administrador inicial omitido: sus variables no están configuradas.");
  process.exit(0);
}

if (!username || !email || !password) {
  console.error("ADMIN_USERNAME, ADMIN_EMAIL y ADMIN_PASSWORD deben configurarse juntas.");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
  process.exit(1);
}

if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
  console.error("ADMIN_USERNAME debe tener entre 3 y 32 caracteres válidos.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO "User" (id, name, username, email, password, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, 'admin', NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET
       name = EXCLUDED.name,
       username = EXCLUDED.username,
       password = EXCLUDED.password,
       role = 'admin',
       "updatedAt" = NOW()`,
    [crypto.randomUUID(), name, username, email, passwordHash]
  );
  console.log(`Administrador sincronizado: ${username}`);
} catch (error) {
  console.error("No fue posible sincronizar el administrador.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
