import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/* The module under test will be dynamically imported to allow
   per-test manipulation of environment variables. */

function freshImport(): Promise<typeof import("./PushService")> {
  vi.resetModules();
  return import("./PushService");
}

const validDTO = {
  endpoint: "https://push.example.com/send/abc",
  keys: { p256dh: "BEXAMPLE", auth: "AEXAMPLE" },
};

describe("PushService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // ---------- IPushService contract via EnvPushService ----------

  describe("EnvPushService (no NOTIFICATIONS_API_URL — no-op mode)", () => {
    beforeEach(() => {
      delete process.env.NOTIFICATIONS_API_URL;
    });

    it("subscribe returns { created: true } and logs a warning", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { EnvPushService } = await freshImport();
      const svc = new EnvPushService();
      const result = await svc.subscribe(validDTO);

      expect(result).toEqual({ created: true });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("NOTIFICATIONS_API_URL")
      );
    });

    it("unsubscribe returns { removed: true } and logs a warning", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { EnvPushService } = await freshImport();
      const svc = new EnvPushService();
      const result = await svc.unsubscribe("https://push.example.com/send/abc");

      expect(result).toEqual({ removed: true });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("NOTIFICATIONS_API_URL")
      );
    });
  });

  describe("EnvPushService (with NOTIFICATIONS_API_URL — proxy mode)", () => {
    const API_URL = "https://notifications-backend.example.com";

    beforeEach(() => {
      process.env.NOTIFICATIONS_API_URL = API_URL;
    });

    it("subscribe proxies POST to external backend /subscribe", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ created: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { EnvPushService } = await freshImport();
      const svc = new EnvPushService();
      const result = await svc.subscribe(validDTO);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${API_URL}/subscribe`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validDTO),
        })
      );
      expect(result).toEqual({ created: true });
    });

    it("unsubscribe proxies POST to external backend /unsubscribe", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ removed: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { EnvPushService } = await freshImport();
      const svc = new EnvPushService();
      const result = await svc.unsubscribe("https://push.example.com/send/abc");

      expect(fetchSpy).toHaveBeenCalledWith(
        `${API_URL}/unsubscribe`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: "https://push.example.com/send/abc" }),
        })
      );
      expect(result).toEqual({ removed: true });
    });

    it("subscribe throws when backend responds with non-ok status", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Internal Server Error", { status: 500 })
      );

      const { EnvPushService } = await freshImport();
      const svc = new EnvPushService();

      await expect(svc.subscribe(validDTO)).rejects.toThrow();
    });

    it("unsubscribe throws when backend responds with non-ok status", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Internal Server Error", { status: 500 })
      );

      const { EnvPushService } = await freshImport();
      const svc = new EnvPushService();

      await expect(
        svc.unsubscribe("https://push.example.com/send/abc")
      ).rejects.toThrow();
    });
  });

  // ---------- Singleton factory ----------

  describe("getPushService", () => {
    it("returns an instance implementing IPushService", async () => {
      const { getPushService } = await freshImport();
      const svc = getPushService();

      expect(svc).toBeDefined();
      expect(typeof svc.subscribe).toBe("function");
      expect(typeof svc.unsubscribe).toBe("function");
    });

    it("returns the same instance on subsequent calls (singleton)", async () => {
      const { getPushService } = await freshImport();
      const a = getPushService();
      const b = getPushService();

      expect(a).toBe(b);
    });
  });
});
