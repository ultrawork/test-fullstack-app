"use client";

import { type ReactNode } from "react";
import type { Category } from "@/types/category";
import Badge from "@/components/ui/Badge";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSelect: (categoryId?: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryFilterProps): ReactNode {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <button
        onClick={() => onSelect(undefined)}
        className={`rounded-full px-3 py-1 text-sm transition-colors ${
          !selectedCategoryId
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            selectedCategoryId === cat.id
              ? "ring-2 ring-blue-500 ring-offset-1"
              : ""
          }`}
        >
          <Badge label={cat.name} color={cat.color} />
        </button>
      ))}
    </div>
  );
}
