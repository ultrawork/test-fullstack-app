"use client";

import { Note } from "@/types/note";
import { PinButton } from "./PinButton";

interface NoteCardProps {
  note: Note;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({
  note,
  onTogglePin,
  onDelete,
}: NoteCardProps): React.ReactElement {
  return (
    <article
      className={`rounded-lg p-4 shadow-sm transition-colors ${
        note.isPinned
          ? "border-2 border-blue-300 bg-blue-50"
          : "border border-gray-200 bg-white"
      }`}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 break-words min-w-0">
          {note.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <PinButton
            isPinned={note.isPinned}
            onToggle={() => onTogglePin(note.id)}
          />
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            aria-label={`Delete note: ${note.title}`}
            className="p-1 rounded text-gray-400 hover:text-red-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </header>
      {note.content && (
        <p className="mt-2 text-gray-600 break-words">{note.content}</p>
      )}
      <footer className="mt-3">
        <time dateTime={note.updatedAt} className="text-xs text-gray-400">
          {new Date(note.updatedAt).toLocaleDateString()}
        </time>
      </footer>
    </article>
  );
}
