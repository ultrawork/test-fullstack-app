"use client";

import { type ReactNode, useEffect } from "react";
import Link from "next/link";
import { useCategoriesStore } from "@/stores/categories-store";
import { useNotesStore } from "@/stores/notes-store";
import Badge from "@/components/ui/Badge";

export default function Sidebar(): ReactNode {
  const { categories, fetchCategories } = useCategoriesStore();
  const { filter, setFilter, fetchNotes } = useNotesStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = (categoryId?: string): void => {
    setFilter({ categoryId, page: 1 });
    fetchNotes();
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50 p-4">
      <nav aria-label="Sidebar navigation">
        <div className="mb-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Navigation
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard"
                className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                All Notes
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/notes/new"
                className="block rounded-md px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                + New Note
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Categories
            </h2>
            <Link
              href="/dashboard/categories"
              className="text-xs text-blue-600 hover:underline"
            >
              Manage
            </Link>
          </div>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleCategoryClick(undefined)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  !filter.categoryId
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                    filter.categoryId === cat.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Badge label={cat.name} color={cat.color} />
                  <span className="text-xs text-gray-400">
                    {cat._count?.notes ?? 0}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
