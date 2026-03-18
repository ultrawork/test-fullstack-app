import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@prisma/client", () => {
  const MockPrismaClient = vi.fn();
  return { PrismaClient: MockPrismaClient };
});

describe("prisma singleton", () => {
  beforeEach(() => {
    vi.resetModules();
    // Clear globalThis cache between tests
    const globalAny = globalThis as Record<string, unknown>;
    delete globalAny.prisma;
  });

  it("exports a PrismaClient instance", async () => {
    const { prisma } = await import("./prisma");
    expect(prisma).toBeDefined();
  });

  it("returns the same instance on multiple imports (singleton)", async () => {
    const mod1 = await import("./prisma");
    const mod2 = await import("./prisma");
    expect(mod1.prisma).toBe(mod2.prisma);
  });

  it("caches instance on globalThis in development mode", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const { prisma } = await import("./prisma");
    const globalAny = globalThis as Record<string, unknown>;
    expect(globalAny.prisma).toBe(prisma);

    process.env.NODE_ENV = originalEnv;
  });
});
