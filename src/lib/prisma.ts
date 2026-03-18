import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient | undefined;
};

/**
 * Creates a PrismaClient singleton with environment-aware logging.
 * In development: logs queries, errors, and warnings.
 * In production: logs errors only.
 * Uses globalThis cache in non-production to survive Next.js HMR reloads.
 */
function createPrismaClient(): PrismaClient {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: isDevelopment ? ["query", "error", "warn"] : ["error"],
  });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
