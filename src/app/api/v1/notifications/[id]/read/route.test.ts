import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockMarkRead } = vi.hoisted(() => ({
  mockMarkRead: vi.fn(),
}));

vi.mock("@/lib/notifications/NotificationService", () => ({
  notificationService: {
    markRead: mockMarkRead,
  },
}));

import { PATCH } from "./route";

function makeRequest(
  url: string,
  headers?: Record<string, string>
): Request {
  return new Request(url, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });
}

describe("PATCH /api/v1/notifications/[id]/read", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-user-id header is missing", async () => {
    const req = makeRequest("http://localhost/api/v1/notifications/n-1/read");
    const res = await PATCH(req, { params: Promise.resolve({ id: "n-1" }) });
    expect(res.status).toBe(401);
  });

  it("marks notification as read and returns it", async () => {
    const notification = { id: "n-1", readAt: new Date().toISOString() };
    mockMarkRead.mockResolvedValue(notification);

    const req = makeRequest("http://localhost/api/v1/notifications/n-1/read", {
      "x-user-id": "user-123",
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "n-1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(notification);
    expect(mockMarkRead).toHaveBeenCalledWith("n-1", "user-123");
  });

  it("returns 404 when notification not found", async () => {
    mockMarkRead.mockResolvedValue(null);

    const req = makeRequest(
      "http://localhost/api/v1/notifications/nonexistent/read",
      { "x-user-id": "user-123" }
    );
    const res = await PATCH(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});
