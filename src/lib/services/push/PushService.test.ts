import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EnvPushService } from "./PushService";
import type { PushSubscriptionDTO } from "@/types/notifications/push";

const validDTO: PushSubscriptionDTO = {
  endpoint: "https://push.example.com/send/abc123",
  keys: { p256dh: "testP256dh", auth: "testAuth" },
};

describe("EnvPushService", () => {
  const originalEnv = process.env.NOTIFICATIONS_API_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NOTIFICATIONS_API_URL;
    } else {
      process.env.NOTIFICATIONS_API_URL = originalEnv;
    }
    vi.restoreAllMocks();
  });

  describe("subscribe (no-op mode)", () => {
    beforeEach(() => {
      delete process.env.NOTIFICATIONS_API_URL;
    });

    it("returns created: true and logs a warning when NOTIFICATIONS_API_URL is not set", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const service = new EnvPushService();
      const result = await service.subscribe(validDTO);
      expect(result).toEqual({ created: true });
      expect(warnSpy).toHaveBeenCalledOnce();
    });
  });

  describe("unsubscribe (no-op mode)", () => {
    beforeEach(() => {
      delete process.env.NOTIFICATIONS_API_URL;
    });

    it("returns removed: true and logs a warning when NOTIFICATIONS_API_URL is not set", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const service = new EnvPushService();
      const result = await service.unsubscribe(validDTO.endpoint);
      expect(result).toEqual({ removed: true });
      expect(warnSpy).toHaveBeenCalledOnce();
    });
  });

  describe("subscribe (proxy mode)", () => {
    beforeEach(() => {
      process.env.NOTIFICATIONS_API_URL = "https://api.example.com";
    });

    it("calls fetch and returns created: true on success", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      const service = new EnvPushService();
      const result = await service.subscribe(validDTO);
      expect(result).toEqual({ created: true });
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.example.com/subscribe",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("throws on non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("error", { status: 502, statusText: "Bad Gateway" })
      );
      const service = new EnvPushService();
      await expect(service.subscribe(validDTO)).rejects.toThrow(
        "Push subscribe proxy failed"
      );
    });
  });

  describe("unsubscribe (proxy mode)", () => {
    beforeEach(() => {
      process.env.NOTIFICATIONS_API_URL = "https://api.example.com";
    });

    it("calls fetch and returns removed: true on success", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      const service = new EnvPushService();
      const result = await service.unsubscribe(validDTO.endpoint);
      expect(result).toEqual({ removed: true });
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.example.com/unsubscribe",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("throws on non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("error", { status: 500, statusText: "Internal Server Error" })
      );
      const service = new EnvPushService();
      await expect(service.unsubscribe(validDTO.endpoint)).rejects.toThrow(
        "Push unsubscribe proxy failed"
      );
    });
  });
});
