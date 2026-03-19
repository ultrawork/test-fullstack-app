"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

interface TagInputProps {
  /** Идентификатор заметки, к которой добавляется тег. */
  noteId: string;
  /** Теги, уже привязанные к заметке (для исключения из подсказок и проверки дубликатов). */
  existingTags: string[];
  /** Вызывается после успешного добавления тега. */
  onAdded: (tag: string) => void;
}

/**
 * Поле ввода тега с автодополнением.
 * Загружает доступные теги через GET /api/tags при маунте/фокусе.
 * Добавляет тег через POST /api/notes/:id/tags.
 */
export default function TagInput({
  noteId,
  existingTags,
  onAdded,
}: TagInputProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const inputId = `tag-input-${noteId}`;
  const listboxId = `tag-suggestions-${noteId}`;
  const tagsLoadedRef = useRef<boolean>(false);

  /** Загружает список доступных тегов через GET /api/tags. */
  const loadTags = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tags");
      if (!res.ok) {
        throw new Error(`Ошибка загрузки тегов: ${res.status}`);
      }
      const data: string[] = await res.json();
      setAvailableTags(Array.from(new Set(data)));
      tagsLoadedRef.current = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось загрузить теги";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Фильтрует подсказки: исключает existingTags, фильтрует по inputValue. */
  const suggestions: string[] = availableTags.filter((tag) => {
    const alreadyExists = existingTags.some(
      (e) => e.toLowerCase() === tag.toLowerCase(),
    );
    if (alreadyExists) return false;
    if (inputValue.trim() === "") return true;
    return tag.toLowerCase().includes(inputValue.trim().toLowerCase());
  });

  /** Проверяет, является ли значение дубликатом. */
  const isDuplicate = (value: string): boolean =>
    existingTags.some((e) => e.toLowerCase() === value.toLowerCase());

  /** Отправляет POST /api/notes/:id/tags и вызывает onAdded. */
  const addTag = async (tag: string): Promise<void> => {
    const trimmed = tag.trim();
    if (!trimmed || isDuplicate(trimmed) || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${noteId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: trimmed }),
      });
      if (!res.ok) {
        throw new Error(`Ошибка добавления тега: ${res.status}`);
      }
      setInputValue("");
      setIsOpen(false);
      setHighlightedIndex(null);
      onAdded(trimmed);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось добавить тег";
      setError(message);
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFocus = (): void => {
    setIsOpen(true);
    if (!tagsLoadedRef.current && !isLoading) {
      loadTags();
    }
  };

  const handleBlur = (): void => {
    // Задержка, чтобы клик по подсказке успел обработаться раньше закрытия списка
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev === null ? 0 : Math.min(prev + 1, suggestions.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev === null ? 0 : Math.max(prev - 1, 0),
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex !== null && suggestions[highlightedIndex]) {
        addTag(suggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(null);
    }
  };

  const isAddDisabled =
    !inputValue.trim() || isDuplicate(inputValue.trim()) || isSubmitting;

  return (
    <div className="relative">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
        Добавить тег
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          data-testid="tag-input"
          type="text"
          role="combobox"
          value={inputValue}
          placeholder="Введите тег..."
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls={isOpen && suggestions.length > 0 ? listboxId : undefined}
          aria-activedescendant={
            highlightedIndex !== null
              ? `option-${noteId}-${highlightedIndex}`
              : undefined
          }
          onChange={(e) => {
            setInputValue(e.target.value);
            setHighlightedIndex(null);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          data-testid="tag-add-button"
          disabled={isAddDisabled}
          onClick={() => addTag(inputValue)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Добавить
        </button>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          data-testid="tag-suggestions"
          role="listbox"
          aria-label="Подсказки тегов"
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`option-${noteId}-${index}`}
              data-testid="tag-suggestion-option"
              role="option"
              aria-selected={highlightedIndex === index}
              onMouseDown={() => addTag(suggestion)}
              className={`cursor-pointer px-3 py-1.5 text-sm ${
                highlightedIndex === index
                  ? "bg-blue-600 text-white"
                  : "text-gray-900 hover:bg-gray-100"
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {error ?? ""}
      </div>
    </div>
  );
}
