import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuditLog, getAuditEntry, AuditApiError } from "./audit";
import type { AuditEntry, AuditLogResponse } from "./audit";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const ENTRY: AuditEntry = {
  id: "audit-1",
  action: "user.login",
  userId: "user-1",
  userEmail: "admin@example.com",
  targetType: "session",
  targetId: "sess-1",
  details: { ip: "127.0.0.1" },
  ipAddress: "127.0.0.1",
  createdAt: "2026-01-15T10:30:00Z",
};

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    json: () => Promise.resolve(data),
    headers: new Headers({ "content-type": "application/json" }),
  } as Response;
}

function errorResponse(status: number, message: string): Response {
  return {
    ok: false,
    status,
    statusText: message,
    json: () => Promise.resolve({ message }),
    headers: new Headers({ "content-type": "application/json" }),
  } as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("audit API", () => {
  describe("getAuditLog", () => {
    it("fetches audit log with no filters", async () => {
      const body: AuditLogResponse = {
        entries: [ENTRY],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(body));

      const result = await getAuditLog();

      expect(result).toEqual(body);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/audit/logs",
        expect.objectContaining({ credentials: "include" }),
      );
    });

    it("passes filter params as query string", async () => {
      const body: AuditLogResponse = {
        entries: [],
        total: 0,
        page: 2,
        limit: 10,
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(body));

      await getAuditLog({
        page: 2,
        limit: 10,
        action: "user.login",
        userId: "user-1",
        from: "2026-01-01",
        to: "2026-01-31",
      });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("/api/v2/audit/logs?");
      expect(calledUrl).toContain("page=2");
      expect(calledUrl).toContain("limit=10");
      expect(calledUrl).toContain("action=user.login");
      expect(calledUrl).toContain("userId=user-1");
      expect(calledUrl).toContain("from=2026-01-01");
      expect(calledUrl).toContain("to=2026-01-31");
    });

    it("omits empty optional params", async () => {
      const body: AuditLogResponse = {
        entries: [],
        total: 0,
        page: 1,
        limit: 20,
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(body));

      await getAuditLog({ page: 1 });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("page=1");
      expect(calledUrl).not.toContain("action=");
      expect(calledUrl).not.toContain("userId=");
    });

    it("throws AuditApiError on failure", async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(403, "Forbidden"));

      await expect(getAuditLog()).rejects.toThrow(AuditApiError);
      expect.assertions(1);
    });
  });

  describe("getAuditEntry", () => {
    it("fetches a single audit entry", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(ENTRY));

      const result = await getAuditEntry("audit-1");

      expect(result).toEqual(ENTRY);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/audit/logs/audit-1",
        expect.objectContaining({ credentials: "include" }),
      );
    });

    it("encodes entry id", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(ENTRY));

      await getAuditEntry("audit/special");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/audit/logs/audit%2Fspecial",
        expect.any(Object),
      );
    });

    it("throws on 404", async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(404, "Not found"));

      await expect(getAuditEntry("missing")).rejects.toThrow(AuditApiError);
      expect.assertions(1);
    });
  });
});
