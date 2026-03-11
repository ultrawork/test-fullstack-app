"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useNotesStore } from "@/stores/notes-store";

const DEBOUNCE_MS = 300;

export function SearchBar(): React.JSX.Element {
  const { searchQuery, setSearchQuery, fetchNotes } = useNotesStore();
  const [inputValue, setInputValue] = useState(searchQuery);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (value: string): void => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setSearchQuery(value);
        fetchNotes(value);
      }, DEBOUNCE_MS);
    },
    [setSearchQuery, fetchNotes],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setInputValue(value);
    handleSearch(value);
  };

  const handleClear = (): void => {
    setInputValue("");
    setSearchQuery("");
    fetchNotes("");

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div role="search">
      <label htmlFor="notes-search" className="sr-only">
        Поиск заметок
      </label>
      <div className="relative">
        <input
          id="notes-search"
          type="search"
          data-testid="search-input"
          aria-label="Поиск заметок"
          placeholder="Поиск заметок..."
          value={inputValue}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Очистить поиск"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
