"use client";

import type { TagDTO } from "@/types";
import TagBadge from "./TagBadge";

interface TagSelectorProps {
  availableTags: TagDTO[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export default function TagSelector({
  availableTags,
  selectedTagIds,
  onChange,
}: TagSelectorProps): React.ReactElement {
  const toggleTag = (tagId: string): void => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">Tags</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Select tags">
        {availableTags.length === 0 && (
          <p className="text-sm text-gray-400">No tags available</p>
        )}
        {availableTags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full transition-opacity ${
                isSelected ? "opacity-100" : "opacity-50 hover:opacity-75"
              }`}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? "Deselect" : "Select"} tag ${tag.name}`}
            >
              <TagBadge name={tag.name} color={tag.color} size="md" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
