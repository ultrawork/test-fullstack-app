import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetHistory, mockCreate } = vi.hoisted(() => ({
  mockGetHistory: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/lib/notifications/NotificationService", () => ({
  notificationService: {
    getHistory: mockGetHistory,
    create: mockCreate,
  },
}));

import { GET, POST } from "./route";

function makeRequest(
  url: string,
  options?: { method?: string; body?: unknown; headers?: Record<string, string> }
): Request {
  const init: RequestInit = {
    method: options?.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...options?.headers,
    },
  };
  if (options?.body) {
    init.body = JSON.stringify(options.body);
  }
  return new Request(url, init);
}

describe("GET /api/v1/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-user-id header is missing", async () => {
    const req = makeRequest("http://localhost/api/v1/notifications");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
  });

  it("returns paginated notifications with default params", async () => {
    const mockData = {
      data: [{ id: "1", title: "Test" }],
      total: 1,
      page: 1,
    };
    mockGetHistory.mockResolvedValue(mockData);

    const req = makeRequest("http://localhost/api/v1/notifications", {
      headers: { "x-user-id": "user-123" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockData);
    expect(mockGetHistory).toHaveBeenCalledWith("user-123", {
      page: 1,
      limit: 20,
    });
  });

  it("passes query params to service", async () => {
    mockGetHistory.mockResolvedValue({ data: [], total: 0, page: 2 });

    const req = makeRequest(
      "http://localhost/api/v1/notifications?page=2&limit=10&type=note_created&priority=high",
      { headers: { "x-user-id": "user-123" } }
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockGetHistory).toHaveBeenCalledWith("user-123", {
      page: 2,
      limit: 10,
      type: "note_created",
      priority: "high",
    });
  });

  it("returns 400 for invalid query params", async () => {
    const req = makeRequest(
      "http://localhost/api/v1/notifications?page=-1",
      { headers: { "x-user-id": "user-123" } }
    );
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});

describe("POST /api/v1/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-user-id header is missing", async () => {
    const req = makeRequest("http://localhost/api/v1/notifications", {
      method: "POST",
      body: { type: "test", title: "Hello", body: "World" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("creates a notification with valid input", async () => {
    const notification = {
      id: "n-1",
      type: "note_created",
      title: "New note",
      body: "Body text",
      priority: "medium",
    };
    mockCreate.mockResolvedValue(notification);

    const req = makeRequest("http://localhost/api/v1/notifications", {
      method: "POST",
      body: { type: "note_created", title: "New note", body: "Body text" },
      headers: { "x-user-id": "user-123" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(notification);
    expect(mockCreate).toHaveBeenCalledWith({
      userId: "user-123",
      type: "note_created",
      title: "New note",
      body: "Body text",
      priority: "medium",
    });
  });

  it("returns 400 for invalid body", async () => {
    const req = makeRequest("http://localhost/api/v1/notifications", {
      method: "POST",
      body: { type: "", title: "" },
      headers: { "x-user-id": "user-123" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("accepts explicit priority", async () => {
    mockCreate.mockResolvedValue({ id: "n-2" });

    const req = makeRequest("http://localhost/api/v1/notifications", {
      method: "POST",
      body: {
        type: "alert",
        title: "Urgent",
        body: "Fix now",
        priority: "urgent",
      },
      headers: { "x-user-id": "user-123" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ priority: "urgent" })
    );
  });
});
