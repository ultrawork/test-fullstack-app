import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/services/push/PushService", () => ({
  getPushService: () => ({
    subscribe: vi.fn().mockResolvedValue({ created: true }),
  }),
}));

function makeRequest(body: string, contentType = "application/json"): Request {
  return new Request("http://localhost/api/v1/notifications/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
}

describe("POST /api/v1/notifications/push/subscribe", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const validBody = JSON.stringify({
    endpoint: "https://push.example.com/send/abc123",
    keys: {
      p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8p8REfWLk=",
      auth: "tBHItJI5svbpC7-BHnIB3w==",
    },
  });

  it("returns 200 with created: true for valid body", async () => {
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true, data: { created: true } });
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await POST(makeRequest("{invalid json"));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.ok).toBe(false);
  });

  it("returns 400 for missing endpoint", async () => {
    const body = JSON.stringify({ keys: { p256dh: "abc", auth: "def" } });
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.error.details).toBeDefined();
    expect(data.error.details.length).toBeGreaterThan(0);
  });

  it("returns 400 for missing keys", async () => {
    const body = JSON.stringify({ endpoint: "https://push.example.com/abc" });
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.ok).toBe(false);
  });

  it("returns 400 for invalid endpoint URL", async () => {
    const body = JSON.stringify({
      endpoint: "not-a-url",
      keys: { p256dh: "abc", auth: "def" },
    });
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.ok).toBe(false);
  });
});
