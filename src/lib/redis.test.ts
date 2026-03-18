import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ioredis", () => {
  const MockRedis = vi.fn();
  return { default: MockRedis };
});

describe("redis singleton", () => {
  beforeEach(() => {
    vi.resetModules();
    const globalAny = globalThis as Record<string, unknown>;
    delete globalAny.redis;
  });

  it("exports a Redis instance", async () => {
    const { redis } = await import("./redis");
    expect(redis).toBeDefined();
  });

  it("returns the same instance on multiple imports (singleton)", async () => {
    const mod1 = await import("./redis");
    const mod2 = await import("./redis");
    expect(mod1.redis).toBe(mod2.redis);
  });

  it("caches instance on globalThis in development mode", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const { redis } = await import("./redis");
    const globalAny = globalThis as Record<string, unknown>;
    expect(globalAny.redis).toBe(redis);

    process.env.NODE_ENV = originalEnv;
  });

  it("uses REDIS_URL from environment", async () => {
    const originalUrl = process.env.REDIS_URL;
    process.env.REDIS_URL = "redis://test-host:6380";

    const { default: MockRedis } = await import("ioredis");
    await import("./redis");

    expect(MockRedis).toHaveBeenCalledWith("redis://test-host:6380");

    process.env.REDIS_URL = originalUrl;
  });
});
