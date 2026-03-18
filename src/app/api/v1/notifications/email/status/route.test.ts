import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    emailQueue: {
      count: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { GET } from "./route";

const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockEmailQueueCount = prisma.emailQueue.count as ReturnType<
  typeof vi.fn
>;

function createRequest(headers?: Record<string, string>): NextRequest {
  return new NextRequest(
    "http://localhost/api/v1/notifications/email/status",
    { headers },
  );
}

describe("GET /api/v1/notifications/email/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no authorization header is provided", async () => {
    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when authorization header does not use Bearer scheme", async () => {
    const response = await GET(
      createRequest({ authorization: "Basic abc123" }),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when Bearer token is empty", async () => {
    const response = await GET(createRequest({ authorization: "Bearer " }));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 403 when user is not found", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const response = await GET(
      createRequest({ authorization: "Bearer valid-token" }),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("Forbidden: admin access required");
  });

  it("returns 403 when user does not have admin role", async () => {
    mockUserFindUnique.mockResolvedValue({ role: "user" });

    const response = await GET(
      createRequest({ authorization: "Bearer user-token" }),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("Forbidden: admin access required");
  });

  it("returns email queue statistics for admin user", async () => {
    mockUserFindUnique.mockResolvedValue({ role: "admin" });
    mockEmailQueueCount
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(120)
      .mockResolvedValueOnce(3);

    const response = await GET(
      createRequest({ authorization: "Bearer admin-token" }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual({
      pending: 5,
      sent: 120,
      failed: 3,
    });
  });

  it("queries email queue with 24-hour time filter", async () => {
    mockUserFindUnique.mockResolvedValue({ role: "admin" });
    mockEmailQueueCount.mockResolvedValue(0);

    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    await GET(createRequest({ authorization: "Bearer admin-token" }));

    const expectedCutoff = new Date(now - 24 * 60 * 60 * 1000);

    expect(mockEmailQueueCount).toHaveBeenCalledTimes(3);

    const pendingCall = mockEmailQueueCount.mock.calls[0][0];
    expect(pendingCall.where.status).toBe("pending");
    expect(pendingCall.where.createdAt.gte).toEqual(expectedCutoff);

    const sentCall = mockEmailQueueCount.mock.calls[1][0];
    expect(sentCall.where.status).toBe("sent");
    expect(sentCall.where.createdAt.gte).toEqual(expectedCutoff);

    const failedCall = mockEmailQueueCount.mock.calls[2][0];
    expect(failedCall.where.status).toBe("failed");
    expect(failedCall.where.createdAt.gte).toEqual(expectedCutoff);

    vi.restoreAllMocks();
  });

  it("passes token as user ID to findUnique", async () => {
    mockUserFindUnique.mockResolvedValue({ role: "admin" });
    mockEmailQueueCount.mockResolvedValue(0);

    await GET(createRequest({ authorization: "Bearer my-user-id" }));

    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { id: "my-user-id" },
      select: { role: true },
    });
  });

  it("returns 500 when database query fails", async () => {
    mockUserFindUnique.mockRejectedValue(new Error("Connection refused"));

    const response = await GET(
      createRequest({ authorization: "Bearer admin-token" }),
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal server error");
  });

  it("returns 500 when email queue count fails", async () => {
    mockUserFindUnique.mockResolvedValue({ role: "admin" });
    mockEmailQueueCount.mockRejectedValue(new Error("Query timeout"));

    const response = await GET(
      createRequest({ authorization: "Bearer admin-token" }),
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal server error");
  });
});
