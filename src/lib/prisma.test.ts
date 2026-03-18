import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/** Tracks constructor calls and their arguments */
const constructorCalls: Record<string, unknown>[][] = [];

vi.mock("@/generated/prisma/client", () => {
  return {
    PrismaClient: class MockPrismaClient {
      constructor(opts?: Record<string, unknown>) {
        constructorCalls.push(opts ? [opts] : []);
      }
    },
  };
});

vi.mock("@prisma/adapter-pg", () => {
  return {
    PrismaPg: class MockPrismaPg {
      constructor() {
        /* mock adapter */
      }
    },
  };
});

describe("prisma singleton", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    constructorCalls.length = 0;
    const g = globalThis as typeof globalThis & { prisma?: unknown };
    delete g.prisma;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("should export a PrismaClient instance as default export", async () => {
    const { default: prisma } = await import("./prisma");
    expect(prisma).toBeDefined();
    expect(constructorCalls.length).toBeGreaterThanOrEqual(1);
  });

  it("should return the same instance on multiple imports (singleton via globalThis)", async () => {
    process.env.NODE_ENV = "development";
    const { default: prisma1 } = await import("./prisma");

    const g = globalThis as typeof globalThis & { prisma?: unknown };
    expect(g.prisma).toBe(prisma1);

    vi.resetModules();
    constructorCalls.length = 0;
    const { default: prisma2 } = await import("./prisma");
    expect(prisma2).toBe(prisma1);
    expect(constructorCalls).toHaveLength(0);
  });

  it("should cache instance on globalThis in development", async () => {
    process.env.NODE_ENV = "development";
    await import("./prisma");

    const g = globalThis as typeof globalThis & { prisma?: unknown };
    expect(g.prisma).toBeDefined();
  });

  it("should NOT cache on globalThis in production", async () => {
    process.env.NODE_ENV = "production";
    await import("./prisma");

    const g = globalThis as typeof globalThis & { prisma?: unknown };
    expect(g.prisma).toBeUndefined();
  });

  it("should configure verbose logging in development", async () => {
    process.env.NODE_ENV = "development";
    await import("./prisma");

    const opts = constructorCalls[0]?.[0] as { log?: string[] } | undefined;
    expect(opts?.log).toContain("query");
    expect(opts?.log).toContain("error");
    expect(opts?.log).toContain("warn");
  });

  it("should configure minimal logging in production", async () => {
    process.env.NODE_ENV = "production";
    await import("./prisma");

    const opts = constructorCalls[0]?.[0] as { log?: string[] } | undefined;
    expect(opts?.log).toContain("error");
    expect(opts?.log).not.toContain("query");
  });

  it("should pass adapter to PrismaClient constructor", async () => {
    await import("./prisma");

    const opts = constructorCalls[0]?.[0] as { adapter?: unknown } | undefined;
    expect(opts?.adapter).toBeDefined();
  });
});
