"use client";

import { useState } from "react";
import { useArchiveStore } from "@/stores/archive-store";
import type { ArchivedNote } from "@/types/archive";

interface ArchiveCardProps {
  item: ArchivedNote;
}

export default function ArchiveCard({
  item,
}: ArchiveCardProps): React.ReactElement {
  const restoreNote = useArchiveStore((state) => state.restoreNote);
  const [loading, setLoading] = useState(false);

  const handleRestore = async (): Promise<void> => {
    if (loading) return;
    setLoading(true);
    try {
      await restoreNote(item.id);
    } finally {
      setLoading(false);
    }
  };

  const truncatedContent =
    item.content.length > 100
      ? item.content.slice(0, 100) + "…"
      : item.content;

  return (
    <article
      data-testid={`archive-card-${item.id}`}
      className="flex items-start justify-between bg-white rounded-lg p-4 shadow-sm"
    >
      <div className="flex-1 min-w-0 mr-4">
        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
        <p className="text-sm text-gray-600 mt-1 break-words">
          {truncatedContent}
        </p>
        <time
          className="text-sm text-gray-500 mt-1 block"
          dateTime={item.archivedAt}
        >
          {new Date(item.archivedAt).toLocaleDateString("ru-RU")}
        </time>
      </div>
      <button
        type="button"
        onClick={handleRestore}
        disabled={loading}
        data-testid={`restore-note-${item.id}`}
        aria-label={`Восстановить "${item.title}" из архива`}
        className={`p-2 text-gray-400 hover:text-green-500 transition-colors rounded-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
          />
        </svg>
      </button>
    </article>
  );
}
