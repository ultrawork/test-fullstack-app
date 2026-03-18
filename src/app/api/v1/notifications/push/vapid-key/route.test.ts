import { describe, it, expect, afterEach, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/v1/notifications/push/vapid-key", () => {
  const originalVapid = process.env.VAPID_PUBLIC_KEY;
  const originalNextPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  afterEach(() => {
    if (originalVapid === undefined) {
      delete process.env.VAPID_PUBLIC_KEY;
    } else {
      process.env.VAPID_PUBLIC_KEY = originalVapid;
    }
    if (originalNextPublic === undefined) {
      delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    } else {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = originalNextPublic;
    }
    vi.restoreAllMocks();
  });

  it("returns 200 with vapidPublicKey when VAPID_PUBLIC_KEY is set", async () => {
    process.env.VAPID_PUBLIC_KEY = "test-vapid-key-123";
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      ok: true,
      data: { vapidPublicKey: "test-vapid-key-123" },
    });
  });

  it("returns 200 with vapidPublicKey when NEXT_PUBLIC_VAPID_PUBLIC_KEY is set", async () => {
    delete process.env.VAPID_PUBLIC_KEY;
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "next-public-vapid-456";
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      ok: true,
      data: { vapidPublicKey: "next-public-vapid-456" },
    });
  });

  it("returns 500 with VAPID_KEY_NOT_CONFIGURED when no key is set", async () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const response = await GET();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("VAPID_KEY_NOT_CONFIGURED");
  });
});
