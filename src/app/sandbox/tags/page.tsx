"use client";

import React, { useState } from "react";
import TagBadge from "@/components/TagBadge";
import TagInput from "@/components/TagInput";

const NOTE_ID = "note-1";

/**
 * Временный sandbox-экран для ручного тестирования TagBadge и TagInput.
 * Требует доступных API: GET /api/tags и POST /api/notes/:id/tags.
 */
export default function TagsSandboxPage(): React.JSX.Element {
  const [tags, setTags] = useState<string[]>(["react", "typescript"]);

  const handleRemove = (tag: string): void => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAdded = (tag: string): void => {
    setTags((prev) => [...prev, tag]);
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">
        Sandbox: TagBadge &amp; TagInput
      </h1>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Текущие теги</h2>
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500">Нет тегов</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                onRemove={() => handleRemove(tag)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <TagInput noteId={NOTE_ID} existingTags={tags} onAdded={handleAdded} />
      </section>

      <aside className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">Примечание</p>
        <p className="mt-1">
          Подсказки и добавление тегов требуют доступных API-эндпоинтов:
        </p>
        <ul className="mt-1 list-inside list-disc">
          <li>
            <code>GET /api/tags</code> — список доступных тегов
          </li>
          <li>
            <code>POST /api/notes/{NOTE_ID}/tags</code> — добавление тега
          </li>
        </ul>
        <p className="mt-1">
          При отсутствии эндпоинтов компонент покажет сообщение об ошибке через{" "}
          <code>aria-live</code>.
        </p>
      </aside>
    </main>
  );
}
