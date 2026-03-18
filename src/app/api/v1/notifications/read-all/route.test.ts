import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockMarkAllRead } = vi.hoisted(() => ({
  mockMarkAllRead: vi.fn(),
}));

vi.mock("@/lib/notifications/NotificationService", () => ({
  notificationService: {
    markAllRead: mockMarkAllRead,
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

describe("PATCH /api/v1/notifications/read-all", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-user-id header is missing", async () => {
    const req = makeRequest("http://localhost/api/v1/notifications/read-all");
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("marks all notifications as read", async () => {
    mockMarkAllRead.mockResolvedValue({ count: 5 });

    const req = makeRequest("http://localhost/api/v1/notifications/read-all", {
      "x-user-id": "user-123",
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ count: 5 });
    expect(mockMarkAllRead).toHaveBeenCalledWith("user-123");
  });

  it("returns count 0 when no unread notifications", async () => {
    mockMarkAllRead.mockResolvedValue({ count: 0 });

    const req = makeRequest("http://localhost/api/v1/notifications/read-all", {
      "x-user-id": "user-123",
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.count).toBe(0);
  });
});
