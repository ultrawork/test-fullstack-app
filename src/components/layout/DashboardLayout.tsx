'use client';

import { type ReactNode } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps): ReactNode {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
