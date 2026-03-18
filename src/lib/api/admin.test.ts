import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  ApiError,
} from "./admin";
import type { Role, User, UsersResponse } from "./admin";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const ROLE_ADMIN: Role = {
  id: "role-1",
  name: "admin",
  permissions: ["users.read", "users.write", "roles.manage"],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const ROLE_VIEWER: Role = {
  id: "role-2",
  name: "viewer",
  permissions: ["users.read"],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const USER: User = {
  id: "user-1",
  email: "admin@example.com",
  role: ROLE_ADMIN,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers({ "content-type": "application/json" }),
  } as Response;
}

function emptyResponse(status = 204): Response {
  return {
    ok: true,
    status,
    statusText: "No Content",
    json: () => Promise.reject(new Error("No body")),
    text: () => Promise.resolve(""),
    headers: new Headers(),
  } as Response;
}

function errorResponse(status: number, message: string): Response {
  return {
    ok: false,
    status,
    statusText: message,
    json: () => Promise.resolve({ message }),
    text: () => Promise.resolve(JSON.stringify({ message })),
    headers: new Headers({ "content-type": "application/json" }),
  } as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("admin API", () => {
  describe("getUsers", () => {
    it("fetches users with default pagination", async () => {
      const body: UsersResponse = {
        users: [USER],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(body));

      const result = await getUsers();

      expect(result).toEqual(body);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/admin/users?page=1&limit=20",
        expect.objectContaining({ credentials: "include" }),
      );
    });

    it("passes custom page and limit", async () => {
      const body: UsersResponse = {
        users: [],
        total: 0,
        page: 3,
        limit: 10,
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(body));

      await getUsers(3, 10);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/admin/users?page=3&limit=10",
        expect.any(Object),
      );
    });

    it("throws ApiError on failure", async () => {
      mockFetch.mockResolvedValue(errorResponse(403, "Forbidden"));

      await expect(getUsers()).rejects.toThrow(ApiError);
      await expect(getUsers()).rejects.toThrow("Forbidden");
    });
  });

  describe("getUserById", () => {
    it("fetches a single user", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(USER));

      const result = await getUserById("user-1");

      expect(result).toEqual(USER);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/admin/users/user-1",
        expect.objectContaining({ credentials: "include" }),
      );
    });

    it("encodes user id", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(USER));

      await getUserById("user/special");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/admin/users/user%2Fspecial",
        expect.any(Object),
      );
    });
  });

  describe("updateUserRole", () => {
    it("sends PATCH with roleId in body", async () => {
      const updated = { ...USER, role: ROLE_VIEWER };
      mockFetch.mockResolvedValueOnce(jsonResponse(updated));

      const result = await updateUserRole("user-1", "role-2");

      expect(result).toEqual(updated);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/admin/users/user-1/role",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ roleId: "role-2" }),
          credentials: "include",
        }),
      );
    });
  });

  describe("deleteUser", () => {
    it("sends DELETE and returns void", async () => {
      mockFetch.mockResolvedValueOnce(emptyResponse());

      await expect(deleteUser("user-1")).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/admin/users/user-1",
        expect.objectContaining({ method: "DELETE", credentials: "include" }),
      );
    });
  });

  describe("getRoles", () => {
    it("fetches all roles", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([ROLE_ADMIN, ROLE_VIEWER]));

      const result = await getRoles();

      expect(result).toEqual([ROLE_ADMIN, ROLE_VIEWER]);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/admin/roles",
        expect.objectContaining({ credentials: "include" }),
      );
    });
  });

  describe("createRole", () => {
    it("sends POST with payload", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(ROLE_VIEWER));

      const result = await createRole({
        name: "viewer",
        permissions: ["users.read"],
      });

      expect(result).toEqual(ROLE_VIEWER);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/admin/roles",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "viewer",
            permissions: ["users.read"],
          }),
        }),
      );
    });
  });

  describe("updateRole", () => {
    it("sends PATCH with partial payload", async () => {
      const updated = { ...ROLE_VIEWER, name: "reader" };
      mockFetch.mockResolvedValueOnce(jsonResponse(updated));

      const result = await updateRole("role-2", { name: "reader" });

      expect(result).toEqual(updated);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/admin/roles/role-2",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ name: "reader" }),
        }),
      );
    });
  });

  describe("deleteRole", () => {
    it("sends DELETE and returns void", async () => {
      mockFetch.mockResolvedValueOnce(emptyResponse());

      await expect(deleteRole("role-2")).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v2/admin/roles/role-2",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("ApiError", () => {
    it("carries status code", async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(404, "Not found"));

      try {
        await getUserById("missing");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).status).toBe(404);
        expect((err as ApiError).message).toBe("Not found");
      }
    });

    it("handles non-JSON error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new Error("not json")),
        headers: new Headers(),
      } as Response);

      await expect(getUserById("x")).rejects.toThrow("Internal Server Error");
    });
  });
});
