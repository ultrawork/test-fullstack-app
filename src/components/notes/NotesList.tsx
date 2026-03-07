"use client";

import { type ReactNode } from "react";
import type { Note } from "@/types/note";
import NoteCard from "@/components/notes/NoteCard";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
}

export default function NotesList({
  notes,
  isLoading,
}: NotesListProps): ReactNode {
  if (isLoading) {
    return <Spinner size="lg" className="py-12" />;
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes yet"
        description="Create your first note to get started."
        action={
          <Link
            href="/dashboard/notes/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Note
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
