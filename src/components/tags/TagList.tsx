"use client";

import TagBadge from "./TagBadge";
import Button from "@/components/ui/Button";
import type { TagWithCount } from "@/types";

interface TagListProps {
  tags: TagWithCount[];
  onEdit: (tag: TagWithCount) => void;
  onDelete: (tagId: string) => void;
}

export default function TagList({
  tags,
  onEdit,
  onDelete,
}: TagListProps): React.ReactElement {
  if (tags.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        No tags yet. Create your first tag!
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100" aria-label="Tags list">
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="flex items-center justify-between py-3"
        >
          <div className="flex items-center gap-3">
            <TagBadge name={tag.name} color={tag.color} size="md" />
            <span className="text-sm text-gray-500">
              {tag.noteCount} {tag.noteCount === 1 ? "note" : "notes"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(tag)}
              aria-label={`Edit tag ${tag.name}`}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(tag.id)}
              aria-label={`Delete tag ${tag.name}`}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
