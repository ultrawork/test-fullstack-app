"use client";

import type { ReactNode } from "react";
import type { Tag } from "@/types/tag";

interface TagFilterProps {
  tags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function TagFilter({
  tags,
  selectedIds,
  onChange,
}: TagFilterProps): ReactNode {
  const handleToggle = (tagId: string): void => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  if (tags.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Filter by tags"
      className="flex flex-wrap gap-2"
    >
      {tags.map((tag) => {
        const isSelected = selectedIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => handleToggle(tag.id)}
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              isSelected
                ? "ring-2 ring-offset-1 ring-gray-900"
                : "opacity-70 hover:opacity-100"
            }`}
            style={{
              backgroundColor: tag.color,
              color: isSelected ? "#000" : undefined,
            }}
            aria-pressed={isSelected}
            aria-label={`Filter by tag ${tag.name}`}
          >
            {tag.name}
          </button>
        );
      })}
      {selectedIds.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="rounded-full px-3 py-1 text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Clear tag filter"
        >
          Clear
        </button>
      )}
    </div>
  );
}
