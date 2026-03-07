"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Note } from "@/types/note";
import TagBadge from "@/components/tags/TagBadge";
import Button from "@/components/ui/Button";

interface NoteViewProps {
  note: Note;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function NoteView({
  note,
  onDelete,
  isDeleting = false,
}: NoteViewProps): ReactNode {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <time dateTime={note.createdAt}>
            Created: {new Date(note.createdAt).toLocaleDateString()}
          </time>
          <time dateTime={note.updatedAt}>
            Updated: {new Date(note.updatedAt).toLocaleDateString()}
          </time>
        </div>
        {note.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        )}
      </header>

      <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
        {note.content}
      </div>

      <footer className="mt-6 flex gap-2 border-t border-gray-200 pt-4">
        <Link href={`/dashboard/notes/${note.id}/edit`}>
          <Button variant="secondary">Edit</Button>
        </Link>
        <Button variant="danger" onClick={onDelete} isLoading={isDeleting}>
          Delete
        </Button>
      </footer>
    </article>
  );
}
