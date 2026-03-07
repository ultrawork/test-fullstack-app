"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import Button from "@/components/ui/Button";

export default function Header(): ReactNode {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-gray-900"
        >
          Notes App
        </Link>
        <nav className="flex items-center gap-4" aria-label="Main navigation">
          <span className="text-sm text-gray-600">
            {user?.name ?? user?.email}
          </span>
          <Button variant="ghost" onClick={handleLogout} aria-label="Log out">
            Log out
          </Button>
        </nav>
      </div>
    </header>
  );
}
