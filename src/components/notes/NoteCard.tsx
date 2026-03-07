"use client";

import TagBadge from "@/components/tags/TagBadge";
import Button from "@/components/ui/Button";
import type { NoteDTO } from "@/types";

interface NoteCardProps {
  note: NoteDTO;
  onEdit: (note: NoteDTO) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteCard({
  note,
  onEdit,
  onDelete,
}: NoteCardProps): React.ReactElement {
  const formattedDate = new Date(note.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {note.title}
        </h3>
        <time
          dateTime={note.updatedAt}
          className="shrink-0 text-xs text-gray-400"
        >
          {formattedDate}
        </time>
      </header>

      <p className="text-sm text-gray-600 line-clamp-3">{note.content}</p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      )}

      <footer className="flex justify-end gap-2 border-t border-gray-100 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(note)}
          aria-label={`Edit note ${note.title}`}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(note.id)}
          aria-label={`Delete note ${note.title}`}
        >
          Delete
        </Button>
      </footer>
    </article>
  );
}
