"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FavoriteItem } from "@/types/favorite";

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (id: string, title: string) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: async (id: string, title: string): Promise<void> => {
        if (get().favorites.some((f) => f.id === id)) return;

        const response = await fetch("/api/v1/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, title }),
        });

        if (response.ok) {
          const json = (await response.json()) as { data: FavoriteItem };
          set((state) => ({
            favorites: [...state.favorites, json.data],
          }));
        }
      },

      removeFavorite: async (id: string): Promise<void> => {
        const response = await fetch(`/api/v1/favorites/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          set((state) => ({
            favorites: state.favorites.filter((f) => f.id !== id),
          }));
        }
      },

      isFavorite: (id: string): boolean => {
        return get().favorites.some((f) => f.id === id);
      },

      clearFavorites: (): void => {
        set({ favorites: [] });
      },
    }),
    {
      name: "favorites-storage",
    },
  ),
);
