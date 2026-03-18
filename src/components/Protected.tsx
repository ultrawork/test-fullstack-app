"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { hasAnyRole } from "@/lib/rbac";
import type { Role } from "@/types/auth";

interface ProtectedProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
}

/** Route guard that requires authentication and optionally specific roles */
export function Protected({ children, requiredRoles }: ProtectedProps): React.JSX.Element | null {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center">
        <span className="text-gray-500" aria-label="Loading">Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles && !hasAnyRole(user, requiredRoles)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">Access denied</p>
      </main>
    );
  }

  return <>{children}</>;
}
