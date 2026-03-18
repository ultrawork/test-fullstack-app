import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { PushService, pushService } from "./PushService";
import {
  PushNotSupportedError,
  PermissionDeniedError,
  ServiceWorkerNotReadyError,
  ApiError,
} from "./errors";
import type { PushServiceConfig } from "./types";

/** Valid URL-safe base64 VAPID key for tests. */
const VALID_VAPID_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkPs7U4HQTY9MR3Uu_kOBuPM0_M3arsd1MDQE1R2s";

/**
 * Helper: creates a PushService with a mocked fetch and browser-like globals.
 */
function createTestService(
  overrides: Partial<PushServiceConfig> = {}
): { service: PushService; mockFetch: Mock } {
  const mockFetch = vi.fn();
  const service = new PushService({
    baseUrl: "https://api.example.com",
    serviceWorkerPath: "/sw.js",
    fetch: mockFetch as unknown as typeof globalThis.fetch,
    ...overrides,
  });
  return { service, mockFetch };
}

/** Stubs browser globals needed for push notification tests. */
function stubBrowserGlobals(
  permissionState: NotificationPermission = "default"
): void {
  Object.defineProperty(globalThis, "window", {
    value: {},
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, "Notification", {
    value: { permission: permissionState, requestPermission: vi.fn() },
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis.navigator, "serviceWorker", {
    value: {
      ready: Promise.resolve({
        pushManager: {
          getSubscription: vi.fn().mockResolvedValue(null),
          subscribe: vi.fn().mockResolvedValue({
            toJSON: () => ({
              endpoint: "https://push.example.com/abc",
              keys: { p256dh: "key1", auth: "key2" },
            }),
          }),
        },
      }),
    },
    configurable: true,
    writable: true,
  });
}

/** Removes browser globals after tests. */
function cleanupBrowserGlobals(): void {
  // @ts-expect-error resetting to undefined
  delete globalThis.window;
  // @ts-expect-error resetting to undefined
  delete globalThis.Notification;
  if (globalThis.navigator) {
    Object.defineProperty(globalThis.navigator, "serviceWorker", {
      value: undefined,
      configurable: true,
      writable: true,
    });
  }
}

describe("PushService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cleanupBrowserGlobals();
  });

  // ──────────────────────── Construction & Config ────────────────────────

  describe("constructor", () => {
    it("creates instance with provided config", () => {
      const { service } = createTestService();
      expect(service).toBeInstanceOf(PushService);
    });

    it("uses default config values when not provided", () => {
      const service = new PushService();
      expect(service).toBeInstanceOf(PushService);
    });
  });

  // ──────────────────────── Singleton export ────────────────────────

  describe("pushService singleton", () => {
    it("is an instance of PushService", () => {
      expect(pushService).toBeInstanceOf(PushService);
    });
  });

  // ──────────────────────── ensureBrowserEnvironment ────────────────────────

  describe("ensureBrowserEnvironment (via public methods)", () => {
    it("throws PushNotSupportedError when window is undefined", async () => {
      cleanupBrowserGlobals();
      const { service } = createTestService();
      await expect(service.subscribe()).rejects.toThrow(PushNotSupportedError);
    });

    it("throws PushNotSupportedError when Notification is undefined", async () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        configurable: true,
        writable: true,
      });
      const { service } = createTestService();
      await expect(service.subscribe()).rejects.toThrow(PushNotSupportedError);
    });
  });

  // ──────────────────────── ensureNotificationsPermission ────────────────────────

  describe("ensureNotificationsPermission (via subscribe)", () => {
    it("requests permission when state is default and grants it", async () => {
      stubBrowserGlobals("default");
      (globalThis.Notification.requestPermission as Mock).mockResolvedValue("granted");

      const { service, mockFetch } = createTestService();
      // Mock getVapidPublicKey call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ publicKey: VALID_VAPID_KEY }),
      });
      // Mock subscribe call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await service.subscribe();
      expect(globalThis.Notification.requestPermission).toHaveBeenCalled();
    });

    it("throws PermissionDeniedError when permission is denied", async () => {
      stubBrowserGlobals("denied");

      const { service } = createTestService();
      await expect(service.subscribe()).rejects.toThrow(PermissionDeniedError);
    });

    it("throws PermissionDeniedError when requestPermission returns denied", async () => {
      stubBrowserGlobals("default");
      (globalThis.Notification.requestPermission as Mock).mockResolvedValue("denied");

      const { service } = createTestService();
      await expect(service.subscribe()).rejects.toThrow(PermissionDeniedError);
    });
  });

  // ──────────────────────── getVapidPublicKey ────────────────────────

  describe("getVapidPublicKey", () => {
    it("fetches and returns the VAPID public key", async () => {
      const { service, mockFetch } = createTestService();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ publicKey: "vapid-key-abc" }),
      });

      const key = await service.getVapidPublicKey();
      expect(key).toBe("vapid-key-abc");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/push/vapid-public-key",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("throws ApiError when the API returns a non-ok response", async () => {
      const { service, mockFetch } = createTestService();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "server error" }),
      });

      await expect(service.getVapidPublicKey()).rejects.toThrow(ApiError);
    });
  });

  // ──────────────────────── subscribe ────────────────────────

  describe("subscribe", () => {
    it("subscribes and sends subscription to the server", async () => {
      stubBrowserGlobals("granted");

      const { service, mockFetch } = createTestService();
      // getVapidPublicKey
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ publicKey: VALID_VAPID_KEY }),
      });
      // POST subscription
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await service.subscribe();
      expect(result).toEqual({ success: true });

      // Verify the POST to /push/subscribe
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const subscribeCall = mockFetch.mock.calls[1];
      expect(subscribeCall[0]).toBe("https://api.example.com/push/subscribe");
      expect(JSON.parse(subscribeCall[1].body)).toEqual({
        endpoint: "https://push.example.com/abc",
        keys: { p256dh: "key1", auth: "key2" },
      });
    });

    it("is idempotent — returns existing subscription without re-subscribing", async () => {
      stubBrowserGlobals("granted");

      const existingSub = {
        toJSON: () => ({
          endpoint: "https://push.example.com/existing",
          keys: { p256dh: "k1", auth: "k2" },
        }),
      };
      const reg = await globalThis.navigator.serviceWorker.ready;
      (reg.pushManager.getSubscription as Mock).mockResolvedValue(existingSub);

      const { service, mockFetch } = createTestService();
      // POST existing subscription
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await service.subscribe();
      expect(result).toEqual({ success: true });
      // Should NOT call getVapidPublicKey since subscription already exists
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("throws ServiceWorkerNotReadyError when serviceWorker is unavailable", async () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        configurable: true,
        writable: true,
      });
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "granted" },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(globalThis.navigator, "serviceWorker", {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const { service } = createTestService();
      await expect(service.subscribe()).rejects.toThrow(ServiceWorkerNotReadyError);
    });
  });

  // ──────────────────────── unsubscribe ────────────────────────

  describe("unsubscribe", () => {
    it("unsubscribes and notifies the server", async () => {
      stubBrowserGlobals("granted");

      const mockUnsubscribe = vi.fn().mockResolvedValue(true);
      const existingSub = {
        endpoint: "https://push.example.com/abc",
        unsubscribe: mockUnsubscribe,
      };
      const reg = await globalThis.navigator.serviceWorker.ready;
      (reg.pushManager.getSubscription as Mock).mockResolvedValue(existingSub);

      const { service, mockFetch } = createTestService();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await service.unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/push/unsubscribe",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ endpoint: "https://push.example.com/abc" }),
        })
      );
    });

    it("does nothing when no subscription exists", async () => {
      stubBrowserGlobals("granted");

      const reg = await globalThis.navigator.serviceWorker.ready;
      (reg.pushManager.getSubscription as Mock).mockResolvedValue(null);

      const { service, mockFetch } = createTestService();
      await service.unsubscribe();

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────── sendToUser ────────────────────────

  describe("sendToUser", () => {
    it("sends notification payload to the specified user", async () => {
      const { service, mockFetch } = createTestService();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: "sent" }),
      });

      const result = await service.sendToUser("user-42", {
        title: "Hello",
        body: "World",
      });

      expect(result).toEqual({ success: true, message: "sent" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/push/send/user-42",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            payload: { title: "Hello", body: "World" },
            options: {},
          }),
        })
      );
    });

    it("passes options to the API request", async () => {
      const { service, mockFetch } = createTestService();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await service.sendToUser(
        "user-1",
        { title: "T", body: "B" },
        { requireInteraction: true, tag: "test" }
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.options).toEqual({ requireInteraction: true, tag: "test" });
    });

    it("throws ApiError when the server returns an error", async () => {
      const { service, mockFetch } = createTestService();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "user not found" }),
      });

      await expect(
        service.sendToUser("unknown", { title: "T", body: "B" })
      ).rejects.toThrow(ApiError);
    });
  });

  // ──────────────────────── fetchJson error handling ────────────────────────

  describe("fetchJson error handling", () => {
    it("throws ApiError with status and body on non-ok response", async () => {
      const { service, mockFetch } = createTestService();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: "forbidden" }),
      });

      try {
        await service.getVapidPublicKey();
        expect.fail("should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).status).toBe(403);
        expect((err as ApiError).body).toEqual({ error: "forbidden" });
      }
    });
  });
});
