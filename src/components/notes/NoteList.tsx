"use client";

import NoteCard from "./NoteCard";
import type { NoteDTO } from "@/types";

interface NoteListProps {
  notes: NoteDTO[];
  isLoading: boolean;
  onEdit: (note: NoteDTO) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteList({
  notes,
  isLoading,
  onEdit,
  onDelete,
}: NoteListProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-gray-400">Loading notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-gray-400">
          No notes yet. Create your first note!
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Notes"
    >
      {notes.map((note) => (
        <div key={note.id} role="listitem">
          <NoteCard note={note} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
