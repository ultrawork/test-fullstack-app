"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Note } from "@/types/note";
import TagBadge from "@/components/tags/TagBadge";
import CategoryBadge from "@/components/categories/CategoryBadge";

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps): ReactNode {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/dashboard/notes/${note.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
      >
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {note.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {note.content}
        </p>
      </Link>
      {(note.category || note.tags.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1">
          {note.category && (
            <CategoryBadge
              name={note.category.name}
              color={note.category.color}
              size="sm"
            />
          )}
          {note.tags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              size="sm"
            />
          ))}
        </div>
      )}
      <time
        className="mt-2 block text-xs text-gray-400"
        dateTime={note.updatedAt}
      >
        {new Date(note.updatedAt).toLocaleDateString()}
      </time>
    </article>
  );
}
