"use client";

import { useFavoritesStore } from "@/stores/favorites-store";
import FavoriteCard from "@/components/favorites/FavoriteCard";
import EmptyFavorites from "@/components/favorites/EmptyFavorites";

export default function FavoritesPage(): React.ReactElement {
  const { favorites, clearFavorites } = useFavoritesStore();

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Избранное</h1>
          {favorites.length > 0 && (
            <button
              type="button"
              onClick={clearFavorites}
              className="text-sm text-red-500 hover:text-red-600 transition-colors"
              aria-label="Очистить все избранные записи"
            >
              Очистить всё
            </button>
          )}
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <ul className="space-y-3">
            {favorites.map((item) => (
              <li key={item.id}>
                <FavoriteCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
