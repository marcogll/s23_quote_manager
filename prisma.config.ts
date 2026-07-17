import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrate: {
    datasource: {
      url: process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/soul23_products",
    },
  },
});
