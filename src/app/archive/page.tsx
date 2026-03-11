"use client";

import { useArchiveStore } from "@/stores/archive-store";
import ArchiveCard from "@/components/archive/ArchiveCard";
import EmptyArchive from "@/components/archive/EmptyArchive";

export default function ArchivePage(): React.ReactElement {
  const archivedNotes = useArchiveStore((s) => s.archivedNotes);

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1
            className="text-2xl font-bold text-gray-900"
            data-testid="archive-title"
          >
            Архив
          </h1>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {archivedNotes.length === 0 ? (
          <EmptyArchive />
        ) : (
          <ul className="space-y-3" data-testid="archive-list">
            {archivedNotes.map((item) => (
              <li key={item.id}>
                <ArchiveCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
