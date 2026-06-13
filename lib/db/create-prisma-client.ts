import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

function isPostgresUrl(url: string): boolean {
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  if (isPostgresUrl(url)) {
    const pool = new pg.Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export function getDatabaseKind(): "sqlite" | "postgresql" {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  return isPostgresUrl(url) ? "postgresql" : "sqlite";
}
