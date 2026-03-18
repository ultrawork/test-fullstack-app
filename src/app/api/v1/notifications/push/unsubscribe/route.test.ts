import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/services/push/PushService", () => ({
  getPushService: () => ({
    unsubscribe: vi.fn().mockResolvedValue({ removed: true }),
  }),
}));

function makeRequest(body: string): Request {
  return new Request("http://localhost/api/v1/notifications/push/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("POST /api/v1/notifications/push/unsubscribe", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 with removed: true for valid body", async () => {
    const body = JSON.stringify({ endpoint: "https://push.example.com/send/abc123" });
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true, data: { removed: true } });
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await POST(makeRequest("{bad json"));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.ok).toBe(false);
  });

  it("returns 400 for missing endpoint", async () => {
    const response = await POST(makeRequest(JSON.stringify({})));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.error.details).toBeDefined();
  });

  it("returns 400 for invalid endpoint URL", async () => {
    const response = await POST(makeRequest(JSON.stringify({ endpoint: "bad" })));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.ok).toBe(false);
  });
});
