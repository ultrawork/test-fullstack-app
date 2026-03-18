import { describe, it, expect } from "vitest";
import {
  type Role,
  ROLE_PERMISSIONS,
  hasPermission,
  hasRole,
  canAccess,
} from "./rbac";

describe("RBAC", () => {
  describe("ROLE_PERMISSIONS", () => {
    it("owner has all CRUD permissions for notes", () => {
      const ownerPerms = ROLE_PERMISSIONS.owner;
      expect(ownerPerms).toContain("notes:read");
      expect(ownerPerms).toContain("notes:create");
      expect(ownerPerms).toContain("notes:update");
      expect(ownerPerms).toContain("notes:delete");
    });

    it("owner has all CRUD permissions for categories", () => {
      const ownerPerms = ROLE_PERMISSIONS.owner;
      expect(ownerPerms).toContain("categories:read");
      expect(ownerPerms).toContain("categories:create");
      expect(ownerPerms).toContain("categories:update");
      expect(ownerPerms).toContain("categories:delete");
    });

    it("owner has account management permissions", () => {
      const ownerPerms = ROLE_PERMISSIONS.owner;
      expect(ownerPerms).toContain("account:read");
      expect(ownerPerms).toContain("account:update");
      expect(ownerPerms).toContain("account:delete");
    });

    it("viewer has only read permissions", () => {
      const viewerPerms = ROLE_PERMISSIONS.viewer;
      expect(viewerPerms).toContain("notes:read");
      expect(viewerPerms).toContain("categories:read");
      expect(viewerPerms).not.toContain("notes:create");
      expect(viewerPerms).not.toContain("notes:update");
      expect(viewerPerms).not.toContain("notes:delete");
      expect(viewerPerms).not.toContain("account:delete");
    });
  });

  describe("hasPermission", () => {
    it("returns true when role has the permission", () => {
      expect(hasPermission("owner", "notes:create")).toBe(true);
    });

    it("returns false when role lacks the permission", () => {
      expect(hasPermission("viewer", "notes:create")).toBe(false);
    });

    it("returns false for unknown role", () => {
      expect(hasPermission("unknown" as Role, "notes:read")).toBe(false);
    });
  });

  describe("hasRole", () => {
    it("returns true for matching role", () => {
      expect(hasRole("owner", "owner")).toBe(true);
    });

    it("returns false for non-matching role", () => {
      expect(hasRole("viewer", "owner")).toBe(false);
    });
  });

  describe("canAccess", () => {
    it("returns true when role has all required permissions", () => {
      expect(canAccess("owner", ["notes:read", "notes:create"])).toBe(true);
    });

    it("returns false when role lacks any required permission", () => {
      expect(canAccess("viewer", ["notes:read", "notes:create"])).toBe(false);
    });

    it("returns true for empty permissions array", () => {
      expect(canAccess("viewer", [])).toBe(true);
    });
  });
});
