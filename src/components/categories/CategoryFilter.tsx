'use client';

import { type ReactNode, useEffect } from 'react';
import { useCategoriesStore } from '@/stores/categories-store';
import { useNotesStore } from '@/stores/notes-store';

export function CategoryFilter(): ReactNode {
  const { categories, fetchCategories } = useCategoriesStore();
  const { filter, setFilter } = useNotesStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div data-testid="category-filter" className="space-y-1">
      <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Categories
      </h3>
      <button
        onClick={() => setFilter({ categoryId: undefined })}
        className={`w-full rounded-md px-3 py-1.5 text-left text-sm ${
          !filter.categoryId ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        All Notes
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setFilter({ categoryId: cat.id })}
          className={`w-full rounded-md px-3 py-1.5 text-left text-sm ${
            filter.categoryId === cat.id
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: cat.color || '#9ca3af' }}
            aria-hidden="true"
          />
          {cat.name}
          {cat._count && <span className="ml-1 text-xs text-gray-400">({cat._count.notes})</span>}
        </button>
      ))}
    </div>
  );
}
