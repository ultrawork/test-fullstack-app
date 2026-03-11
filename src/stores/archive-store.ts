"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ArchivedNote, ApiResponse } from "@/types/archive";

interface ArchiveState {
  archivedNotes: ArchivedNote[];
  archiveNote: (id: string, title: string, content: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  isArchived: (id: string) => boolean;
  fetchArchived: () => Promise<void>;
}

export const useArchiveStore = create<ArchiveState>()(
  persist(
    (set, get) => ({
      archivedNotes: [],

      archiveNote: async (
        id: string,
        title: string,
        content: string,
      ): Promise<void> => {
        if (get().archivedNotes.some((n) => n.id === id)) return;

        try {
          const response = await fetch(`/api/v1/notes/${id}/archive`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content }),
          });

          if (response.ok) {
            const json = (await response.json()) as ApiResponse<ArchivedNote>;
            if (json.success) {
              set((state) => ({
                archivedNotes: [...state.archivedNotes, json.data],
              }));
            }
          }
        } catch (error) {
          console.error("Failed to archive note:", error);
        }
      },

      restoreNote: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`/api/v1/notes/${id}/restore`, {
            method: "POST",
          });

          if (response.ok || response.status === 404) {
            set((state) => ({
              archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
            }));
          }
        } catch (error) {
          console.error("Failed to restore note:", error);
        }
      },

      isArchived: (id: string): boolean => {
        return get().archivedNotes.some((n) => n.id === id);
      },

      fetchArchived: async (): Promise<void> => {
        try {
          const response = await fetch("/api/v1/notes/archived");

          if (response.ok) {
            const json = (await response.json()) as ApiResponse<ArchivedNote[]>;
            if (json.success) {
              set({ archivedNotes: json.data });
            }
          }
        } catch (error) {
          console.error("Failed to fetch archived notes:", error);
        }
      },
    }),
    {
      name: "archive-storage",
    },
  ),
);
