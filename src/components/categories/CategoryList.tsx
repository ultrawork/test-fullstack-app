"use client";

import type { ReactNode } from "react";
import type { CategoryWithNoteCount } from "@/types/category";
import CategoryBadge from "./CategoryBadge";

interface CategoryListProps {
  categories: CategoryWithNoteCount[];
  onEdit: (category: CategoryWithNoteCount) => void;
  onDelete: (category: CategoryWithNoteCount) => void;
}

export default function CategoryList({
  categories,
  onEdit,
  onDelete,
}: CategoryListProps): ReactNode {
  if (categories.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        No categories yet. Create your first category!
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {categories.map((category) => (
        <li
          key={category.id}
          className="flex items-center justify-between py-3"
        >
          <div className="flex items-center gap-3">
            <CategoryBadge name={category.name} color={category.color} />
            <span className="text-sm text-gray-500">
              {category._count.notes}{" "}
              {category._count.notes === 1 ? "note" : "notes"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Edit category ${category.name}`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(category)}
              className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={`Delete category ${category.name}`}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
