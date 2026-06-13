import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/** Supabase: use DIRECT_DATABASE_URL (port 5432) for migrations; DATABASE_URL can be the pooler. */
const datasourceUrl = process.env.DIRECT_DATABASE_URL ?? env("DATABASE_URL");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: datasourceUrl,
  },
});
