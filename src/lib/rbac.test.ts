import { describe, it, expect } from "vitest";
import { hasRole, hasAnyRole } from "./rbac";
import type { User } from "@/types/auth";

const adminUser: User = {
  id: "1",
  email: "admin@test.com",
  roles: ["ROLE_ADMIN", "ROLE_USER"],
};

const regularUser: User = {
  id: "2",
  email: "user@test.com",
  roles: ["ROLE_USER"],
};

describe("hasRole", () => {
  it("returns true when user has the role", () => {
    expect(hasRole(adminUser, "ROLE_ADMIN")).toBe(true);
  });

  it("returns false when user does not have the role", () => {
    expect(hasRole(regularUser, "ROLE_ADMIN")).toBe(false);
  });

  it("returns false when user is null", () => {
    expect(hasRole(null, "ROLE_USER")).toBe(false);
  });
});

describe("hasAnyRole", () => {
  it("returns true when user has at least one role", () => {
    expect(hasAnyRole(regularUser, ["ROLE_ADMIN", "ROLE_USER"])).toBe(true);
  });

  it("returns false when user has none of the roles", () => {
    expect(hasAnyRole(regularUser, ["ROLE_ADMIN"])).toBe(false);
  });

  it("returns false when user is null", () => {
    expect(hasAnyRole(null, ["ROLE_USER"])).toBe(false);
  });
});
