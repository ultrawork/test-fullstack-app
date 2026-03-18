/** Supported roles in the system */
export type Role = "owner" | "viewer";

/** Resource-action permission strings */
export type Permission =
  | "notes:read"
  | "notes:create"
  | "notes:update"
  | "notes:delete"
  | "categories:read"
  | "categories:create"
  | "categories:update"
  | "categories:delete"
  | "account:read"
  | "account:update"
  | "account:delete";

/** Mapping of roles to their allowed permissions */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: [
    "notes:read",
    "notes:create",
    "notes:update",
    "notes:delete",
    "categories:read",
    "categories:create",
    "categories:update",
    "categories:delete",
    "account:read",
    "account:update",
    "account:delete",
  ],
  viewer: ["notes:read", "categories:read"],
};

/** Check if a role has a specific permission */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/** Check if the user's role matches the required role */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return userRole === requiredRole;
}

/** Check if a role has all the required permissions */
export function canAccess(role: Role, required: readonly Permission[]): boolean {
  return required.every((perm) => hasPermission(role, perm));
}
