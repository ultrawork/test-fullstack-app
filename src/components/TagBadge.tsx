"use client";

import React from "react";

/** Набор предопределённых цветовых пресетов для бейджей тегов. */
const COLOR_PRESETS: string[] = [
  "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
  "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
  "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  "bg-teal-100 text-teal-800 ring-1 ring-teal-200",
  "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
  "bg-pink-100 text-pink-800 ring-1 ring-pink-200",
  "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
  "bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200",
  "bg-lime-100 text-lime-800 ring-1 ring-lime-200",
  "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
];

/**
 * Детерминированный хэш строки (DJB2).
 * Всегда возвращает одно и то же число для одной и той же строки.
 */
function hashTag(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

interface TagBadgeProps {
  /** Текст тега. */
  tag: string;
  /** Если передан — показывается кнопка удаления. */
  onRemove?: () => void;
}

/**
 * Бейдж тега с детерминированным цветом на основе хэша строки.
 * Опционально показывает кнопку удаления.
 */
export default function TagBadge({
  tag,
  onRemove,
}: TagBadgeProps): React.JSX.Element {
  const colorClass = COLOR_PRESETS[hashTag(tag) % COLOR_PRESETS.length];

  return (
    <span
      data-testid="tag-badge"
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      <span>{tag}</span>
      {onRemove !== undefined && (
        <button
          type="button"
          data-testid="tag-badge-remove"
          aria-label={`Удалить тег ${tag}`}
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        >
          ×
        </button>
      )}
    </span>
  );
}
