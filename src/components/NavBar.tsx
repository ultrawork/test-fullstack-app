"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { hasRole } from "@/lib/rbac";

/** Navigation bar with RBAC-based visibility and auth initialization */
export function NavBar(): React.JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <nav className="border-b border-gray-200 bg-white" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-gray-900">
          Notes App
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              {hasRole(user, "ROLE_ADMIN") && (
                <Link
                  href="/admin/roles"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-gray-500">{user.email}</span>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
