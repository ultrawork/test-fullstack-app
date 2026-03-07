"use client";

import { type ReactNode } from "react";
import type { Note } from "@/types/note";
import NoteCard from "@/components/notes/NoteCard";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
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
          <Link href="/dashboard/notes/new">
            <Button>Create Note</Button>
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
