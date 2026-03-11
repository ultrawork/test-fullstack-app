"use client";

import type { ReactNode } from "react";
import type { CategoryWithNoteCount } from "@/types/category";
import { getContrastColor } from "@/components/tags/TagBadge";

interface CategoryFilterProps {
  categories: CategoryWithNoteCount[];
  selectedId: string | null;
  onChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedId,
  onChange,
}: CategoryFilterProps): ReactNode {
  if (categories.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex flex-wrap gap-2"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`inline-flex items-center rounded px-3 py-1 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
          selectedId === null
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        aria-pressed={selectedId === null}
      >
        All
      </button>
      {categories.map((category) => {
        const isSelected = selectedId === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(isSelected ? null : category.id)}
            className={`inline-flex items-center gap-1 rounded px-3 py-1 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              isSelected
                ? "ring-2 ring-offset-1 ring-gray-900"
                : "opacity-70 hover:opacity-100"
            }`}
            style={{
              backgroundColor: category.color,
              color: getContrastColor(category.color),
            }}
            aria-pressed={isSelected}
            aria-label={`Filter by category ${category.name}`}
          >
            {category.name}
            <span className="opacity-75">({category._count.notes})</span>
          </button>
        );
      })}
    </div>
  );
}
