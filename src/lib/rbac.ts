import type { Role, User } from "@/types/auth";

/** Check if the user has a specific role */
export function hasRole(user: User | null, role: Role): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

/** Check if the user has at least one of the specified roles */
export function hasAnyRole(user: User | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}
