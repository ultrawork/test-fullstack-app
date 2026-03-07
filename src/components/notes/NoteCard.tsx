"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Note } from "@/types/note";
import TagBadge from "@/components/tags/TagBadge";

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
      {note.tags.length > 0 && (
        <ul role="list" className="mt-3 flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <li key={tag.id}>
              <TagBadge
                name={tag.name}
                color={tag.color}
                size="sm"
              />
            </li>
          ))}
        </ul>
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
