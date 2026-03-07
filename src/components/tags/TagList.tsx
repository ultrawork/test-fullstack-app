"use client";

import type { ReactNode } from "react";
import type { TagWithNoteCount } from "@/types/tag";
import TagBadge from "./TagBadge";

interface TagListProps {
  tags: TagWithNoteCount[];
  onEdit: (tag: TagWithNoteCount) => void;
  onDelete: (tag: TagWithNoteCount) => void;
}

export default function TagList({
  tags,
  onEdit,
  onDelete,
}: TagListProps): ReactNode {
  if (tags.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        No tags yet. Create your first tag!
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {tags.map((tag) => (
        <li key={tag.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <TagBadge name={tag.name} color={tag.color} />
            <span className="text-sm text-gray-500">
              {tag._count.notes} {tag._count.notes === 1 ? "note" : "notes"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(tag)}
              className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Edit tag ${tag.name}`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(tag)}
              className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={`Delete tag ${tag.name}`}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
