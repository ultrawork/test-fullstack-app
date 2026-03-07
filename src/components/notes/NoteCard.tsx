"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import type { Note } from "@/types/note";
import Badge from "@/components/ui/Badge";

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps): ReactNode {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      <Link href={`/dashboard/notes/${note.id}`} className="block">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
            {note.title}
          </h3>
          {note.category && (
            <Badge label={note.category.name} color={note.category.color} />
          )}
        </div>
        <p className="mb-3 text-sm text-gray-600 line-clamp-3">
          {note.content}
        </p>
        <time
          className="text-xs text-gray-400"
          dateTime={note.updatedAt}
        >
          {new Date(note.updatedAt).toLocaleDateString()}
        </time>
      </Link>
    </article>
  );
}
