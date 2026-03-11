"use client";

import { useFavoritesStore } from "@/stores/favorites-store";
import type { FavoriteItem } from "@/types/favorite";

interface FavoriteCardProps {
  item: FavoriteItem;
}

export default function FavoriteCard({
  item,
}: FavoriteCardProps): React.ReactElement {
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  const handleRemove = async (): Promise<void> => {
    await removeFavorite(item.id);
  };

  return (
    <article className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
        <time className="text-sm text-gray-500" dateTime={item.createdAt}>
          {new Date(item.createdAt).toLocaleDateString("ru-RU")}
        </time>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        aria-label={`Удалить "${item.title}" из избранного`}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full"
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
    </article>
  );
}
