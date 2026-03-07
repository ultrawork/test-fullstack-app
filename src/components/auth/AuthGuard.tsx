"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import Spinner from "@/components/ui/Spinner";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps): ReactNode {
  const router = useRouter();
  const { isAuthenticated, isCheckingAuth, fetchUser } = useAuthStore();

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isCheckingAuth, isAuthenticated, router]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
