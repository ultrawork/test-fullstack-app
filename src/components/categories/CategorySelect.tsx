"use client";

import type { ReactNode } from "react";
import type { CategoryWithNoteCount } from "@/types/category";

interface CategorySelectProps {
  categories: CategoryWithNoteCount[];
  selectedId: string | null;
  onChange: (categoryId: string | null) => void;
}

export default function CategorySelect({
  categories,
  selectedId,
  onChange,
}: CategorySelectProps): ReactNode {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="category-select"
        className="text-sm font-medium text-gray-700"
      >
        Category
      </label>
      <select
        id="category-select"
        value={selectedId ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">No category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
