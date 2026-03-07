'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CategoryFilter } from '@/components/categories/CategoryFilter';

export function Sidebar(): ReactNode {
  return (
    <aside data-testid="sidebar" className="w-64 border-r border-gray-200 bg-gray-50 p-4">
      <div className="mb-6">
        <Link href="/dashboard/notes/new" data-testid="new-note-link">
          <Button className="w-full">New Note</Button>
        </Link>
      </div>
      <nav>
        <CategoryFilter />
        <div className="mt-4">
          <Link
            href="/dashboard/categories" data-testid="manage-categories-link"
            className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Manage Categories
          </Link>
        </div>
      </nav>
    </aside>
  );
}
