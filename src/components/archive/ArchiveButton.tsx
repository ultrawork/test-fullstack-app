"use client";

import { useState } from "react";
import { useArchiveStore } from "@/stores/archive-store";

interface ArchiveButtonProps {
  id: string;
  title: string;
  content: string;
}

export default function ArchiveButton({
  id,
  title,
  content,
}: ArchiveButtonProps): React.ReactElement {
  const archiveNote = useArchiveStore((s) => s.archiveNote);
  const restoreNote = useArchiveStore((s) => s.restoreNote);
  const active = useArchiveStore((s) =>
    s.archivedNotes.some((n) => n.id === id),
  );
  const [loading, setLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    if (loading) return;
    setLoading(true);
    try {
      if (active) {
        await restoreNote(id);
      } else {
        await archiveNote(id, title, content);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      data-testid={`archive-button-${id}`}
      aria-pressed={active}
      aria-label={
        active
          ? `Восстановить "${title}" из архива`
          : `Архивировать "${title}"`
      }
      className={`p-2 rounded-full transition-colors ${
        active
          ? "text-amber-500 hover:text-amber-600"
          : "text-gray-400 hover:text-amber-400"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
        />
      </svg>
    </button>
  );
}
