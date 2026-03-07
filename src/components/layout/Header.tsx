'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/Button';

export function Header(): ReactNode {
  const { user, logout } = useAuthStore();

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return (
    <header data-testid="header" className="border-b border-gray-200 bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"
        aria-label="Main navigation"
      >
        <Link href="/dashboard" className="text-xl font-bold text-gray-900" data-testid="header-logo">
          Notes App
        </Link>
        <ul className="flex items-center gap-4 list-none m-0 p-0">
          {user && (
            <li>
              <span className="text-sm text-gray-600" data-testid="user-email">{user.email}</span>
            </li>
          )}
          <li>
            <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Sign out" data-testid="sign-out-button">
              Sign out
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
