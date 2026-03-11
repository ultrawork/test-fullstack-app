"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import TagManagerModal from "@/components/tags/TagManagerModal";

export default function Header(): ReactNode {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  const handleLogout = async (): Promise<void> => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"
          aria-label="Main navigation"
        >
          <Link
            href="/dashboard"
            className="text-xl font-bold text-gray-900 hover:text-gray-700"
          >
            Notes App
          </Link>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsTagManagerOpen(true)}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Manage tags"
            >
              Tags
            </button>

            <Link
              href="/dashboard/categories"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Categories
            </Link>

            {user && <span className="text-sm text-gray-600">{user.name}</span>}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
    </>
  );
}
