import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUnreadCount } = vi.hoisted(() => ({
  mockGetUnreadCount: vi.fn(),
}));

vi.mock("@/lib/notifications/NotificationService", () => ({
  notificationService: {
    getUnreadCount: mockGetUnreadCount,
  },
}));

import { GET } from "./route";

function makeRequest(
  url: string,
  headers?: Record<string, string>
): Request {
  return new Request(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });
}

describe("GET /api/v1/notifications/unread-count", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-user-id header is missing", async () => {
    const req = makeRequest(
      "http://localhost/api/v1/notifications/unread-count"
    );
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns unread count", async () => {
    mockGetUnreadCount.mockResolvedValue(7);

    const req = makeRequest(
      "http://localhost/api/v1/notifications/unread-count",
      { "x-user-id": "user-123" }
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ count: 7 });
    expect(mockGetUnreadCount).toHaveBeenCalledWith("user-123");
  });

  it("returns 0 when no unread notifications", async () => {
    mockGetUnreadCount.mockResolvedValue(0);

    const req = makeRequest(
      "http://localhost/api/v1/notifications/unread-count",
      { "x-user-id": "user-123" }
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.count).toBe(0);
  });
});
