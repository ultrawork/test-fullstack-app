"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FavoriteItem, ApiResponse } from "@/types/favorite";

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (id: string, title: string) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: async (id: string, title: string): Promise<void> => {
        if (get().favorites.some((f) => f.id === id)) return;

        try {
          const response = await fetch("/api/v1/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, title }),
          });

          if (response.ok) {
            const json = (await response.json()) as ApiResponse<FavoriteItem>;
            if (json.success) {
              set((state) => ({
                favorites: [...state.favorites, json.data],
              }));
            }
          }
        } catch (error) {
          console.error("Failed to add favorite:", error);
        }
      },

      removeFavorite: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`/api/v1/favorites/${id}`, {
            method: "DELETE",
          });

          if (response.ok || response.status === 404) {
            set((state) => ({
              favorites: state.favorites.filter((f) => f.id !== id),
            }));
          }
        } catch (error) {
          console.error("Failed to remove favorite:", error);
        }
      },

      isFavorite: (id: string): boolean => {
        return get().favorites.some((f) => f.id === id);
      },

      clearFavorites: async (): Promise<void> => {
        try {
          const response = await fetch("/api/v1/favorites", {
            method: "DELETE",
          });

          if (response.ok) {
            set({ favorites: [] });
          }
        } catch (error) {
          console.error("Failed to clear favorites:", error);
        }
      },
    }),
    {
      name: "favorites-storage",
    },
  ),
);
