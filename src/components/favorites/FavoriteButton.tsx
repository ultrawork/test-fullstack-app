"use client";

import { useState } from "react";
import { useFavoritesStore } from "@/stores/favorites-store";

interface FavoriteButtonProps {
  id: string;
  title: string;
}

export default function FavoriteButton({
  id,
  title,
}: FavoriteButtonProps): React.ReactElement {
  const addFavorite = useFavoritesStore((s) => s.addFavorite);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const active = useFavoritesStore((s) => s.favorites.some((f) => f.id === id));
  const [loading, setLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    if (loading) return;
    setLoading(true);
    try {
      if (active) {
        await removeFavorite(id);
      } else {
        await addFavorite(id, title);
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
      aria-pressed={active}
      aria-label={
        active
          ? `Удалить "${title}" из избранного`
          : `Добавить "${title}" в избранное`
      }
      className={`p-2 rounded-full transition-colors ${
        active
          ? "text-red-500 hover:text-red-600"
          : "text-gray-400 hover:text-red-400"
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
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
