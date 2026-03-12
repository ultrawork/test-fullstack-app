'use client';

import { type ReactNode } from 'react';
import { useNotesStore } from '@/stores/notes-store';
import type { SortByField, SortOrder } from '@/types/note';

const VALID_SORT_FIELDS: SortByField[] = ['createdAt', 'updatedAt', 'title'];

function isSortByField(value: string): value is SortByField {
  return (VALID_SORT_FIELDS as string[]).includes(value);
}

export function SortSelector(): ReactNode {
  const filter = useNotesStore((s) => s.filter);
  const setFilter = useNotesStore((s) => s.setFilter);

  const sortBy = filter.sortBy ?? 'updatedAt';
  const sortOrder = filter.sortOrder ?? 'desc';

  function handleSortByChange(value: string): void {
    if (isSortByField(value)) {
      setFilter({ sortBy: value });
    }
  }

  function toggleSortOrder(): void {
    const next: SortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setFilter({ sortOrder: next });
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Sort options">
      <label htmlFor="sort-select" className="sr-only">
        Sort by
      </label>
      <select
        id="sort-select"
        data-testid="sort-select"
        value={sortBy}
        onChange={(e) => handleSortByChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="updatedAt">Date updated</option>
        <option value="createdAt">Date created</option>
        <option value="title">Title</option>
      </select>
      <button
        type="button"
        data-testid="sort-order-button"
        onClick={toggleSortOrder}
        aria-label={sortOrder === 'desc' ? 'Sort descending' : 'Sort ascending'}
        className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {sortOrder === 'desc' ? (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
