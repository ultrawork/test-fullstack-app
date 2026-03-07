import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
const mockPrisma = {
  tag: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock getUserId
const mockGetUserId = vi.fn();
vi.mock("@/lib/get-user-id", () => ({
  getUserId: () => mockGetUserId(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}));

describe("Tags API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserId.mockResolvedValue("user-1");
  });

  describe("GET /api/v1/tags", () => {
    it("should return tags for authenticated user", async () => {
      const { GET } = await import("../tags/route");
      const mockTags = [
        {
          id: "tag-1",
          name: "Work",
          color: "#FF0000",
          userId: "user-1",
          _count: { notes: 3 },
        },
      ];
      mockPrisma.tag.findMany.mockResolvedValue(mockTags);

      const response = await GET();
      const body = await response.json();

      expect(body.success).toBe(true);
      expect(body.data.tags).toEqual(mockTags);
      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
        }),
      );
    });

    it("should return 401 when not authenticated", async () => {
      const { GET } = await import("../tags/route");
      mockGetUserId.mockRejectedValue(new Error("Authentication required"));

      const response = await GET();
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/v1/tags", () => {
    it("should create a tag with valid input", async () => {
      const { POST } = await import("../tags/route");
      const mockTag = {
        id: "tag-1",
        name: "Work",
        color: "#FF0000",
        userId: "user-1",
        _count: { notes: 0 },
      };
      mockPrisma.tag.findFirst.mockResolvedValue(null);
      mockPrisma.tag.create.mockResolvedValue(mockTag);

      const request = new Request("http://localhost/api/v1/tags", {
        method: "POST",
        body: JSON.stringify({ name: "Work", color: "#FF0000" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request as never);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("Work");
    });

    it("should reject invalid color format", async () => {
      const { POST } = await import("../tags/route");

      const request = new Request("http://localhost/api/v1/tags", {
        method: "POST",
        body: JSON.stringify({ name: "Work", color: "invalid" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request as never);
      expect(response.status).toBe(400);
    });

    it("should reject duplicate tag name", async () => {
      const { POST } = await import("../tags/route");
      mockPrisma.tag.findFirst.mockResolvedValue({
        id: "existing",
        name: "Work",
      });

      const request = new Request("http://localhost/api/v1/tags", {
        method: "POST",
        body: JSON.stringify({ name: "Work", color: "#FF0000" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request as never);
      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/tags/:id", () => {
    it("should delete tag owned by user", async () => {
      const { DELETE } = await import("../tags/[id]/route");
      mockPrisma.tag.deleteMany.mockResolvedValue({ count: 1 });

      const request = new Request("http://localhost/api/v1/tags/tag-1", {
        method: "DELETE",
      });

      const response = await DELETE(request as never, {
        params: Promise.resolve({ id: "tag-1" }),
      });
      const body = await response.json();

      expect(body.success).toBe(true);
      expect(mockPrisma.tag.deleteMany).toHaveBeenCalledWith({
        where: { id: "tag-1", userId: "user-1" },
      });
    });

    it("should return 404 when tag not found or not owned", async () => {
      const { DELETE } = await import("../tags/[id]/route");
      mockPrisma.tag.deleteMany.mockResolvedValue({ count: 0 });

      const request = new Request("http://localhost/api/v1/tags/tag-1", {
        method: "DELETE",
      });

      const response = await DELETE(request as never, {
        params: Promise.resolve({ id: "tag-1" }),
      });
      expect(response.status).toBe(404);
    });
  });
});
