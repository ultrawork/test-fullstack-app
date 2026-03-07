"use client";

import type { TagDTO } from "@/types";
import TagBadge from "./TagBadge";

interface TagFilterProps {
  tags: TagDTO[];
  selectedTagIds: string[];
  onToggle: (tagId: string) => void;
}

export default function TagFilter({
  tags,
  selectedTagIds,
  onToggle,
}: TagFilterProps): React.ReactElement {
  if (tags.length === 0) return <></>;

  return (
    <nav aria-label="Filter by tags">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Filter:</span>
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.id)}
              className={`rounded-full transition-opacity ${
                isSelected ? "opacity-100 ring-2 ring-gray-400 ring-offset-1" : "opacity-60 hover:opacity-80"
              }`}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? "Remove filter" : "Filter by"} ${tag.name}`}
            >
              <TagBadge name={tag.name} color={tag.color} />
            </button>
          );
        })}
        {selectedTagIds.length > 0 && (
          <button
            type="button"
            onClick={() => selectedTagIds.forEach(onToggle)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            aria-label="Clear all tag filters"
          >
            Clear
          </button>
        )}
      </div>
    </nav>
  );
}
