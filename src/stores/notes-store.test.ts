import { describe, it, expect, beforeEach, vi } from "vitest";
import { useNotesStore } from "./notes-store";
import { Note } from "@/types/note";
import { act } from "@testing-library/react";

const mockNote: Note = {
  id: "1",
  title: "Test Note",
  content: "Test content",
  isPinned: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockPinnedNote: Note = {
  id: "2",
  title: "Pinned Note",
  content: "Pinned content",
  isPinned: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

beforeEach(() => {
  useNotesStore.setState({ notes: [], isLoading: false, error: null });
  vi.restoreAllMocks();
});

describe("notes-store", () => {
  describe("fetchNotes", () => {
    it("fetches and sorts notes with pinned first", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify([mockNote, mockPinnedNote]), {
          status: 200,
        }),
      );

      await act(async () => {
        await useNotesStore.getState().fetchNotes();
      });

      const { notes, isLoading } = useNotesStore.getState();
      expect(isLoading).toBe(false);
      expect(notes).toHaveLength(2);
      expect(notes[0].id).toBe("2"); // pinned first
      expect(notes[1].id).toBe("1");
    });

    it("sets error on fetch failure", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(null, { status: 500 }),
      );

      await act(async () => {
        await useNotesStore.getState().fetchNotes();
      });

      const { error, isLoading } = useNotesStore.getState();
      expect(isLoading).toBe(false);
      expect(error).toBe("Failed to fetch notes");
    });
  });

  describe("togglePin", () => {
    it("optimistically toggles pin and updates on success", async () => {
      useNotesStore.setState({ notes: [mockNote] });

      const toggledNote = { ...mockNote, isPinned: true };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(toggledNote), { status: 200 }),
      );

      await act(async () => {
        await useNotesStore.getState().togglePin("1");
      });

      const { notes } = useNotesStore.getState();
      expect(notes[0].isPinned).toBe(true);
    });

    it("rolls back on toggle failure", async () => {
      useNotesStore.setState({ notes: [{ ...mockNote }] });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(null, { status: 500 }),
      );

      await act(async () => {
        await useNotesStore.getState().togglePin("1");
      });

      const { notes, error } = useNotesStore.getState();
      expect(notes[0].isPinned).toBe(false); // rolled back
      expect(error).toBe("Failed to toggle pin");
    });
  });

  describe("addNote", () => {
    it("adds a new note", async () => {
      const newNote: Note = {
        ...mockNote,
        id: "3",
        title: "New Note",
      };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(newNote), { status: 201 }),
      );

      await act(async () => {
        await useNotesStore.getState().addNote("New Note", "Content");
      });

      const { notes } = useNotesStore.getState();
      expect(notes).toHaveLength(1);
      expect(notes[0].title).toBe("New Note");
    });
  });

  describe("deleteNote", () => {
    it("successfully deletes a note", async () => {
      useNotesStore.setState({ notes: [{ ...mockNote }] });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

      await act(async () => {
        await useNotesStore.getState().deleteNote("1");
      });

      const { notes, error } = useNotesStore.getState();
      expect(notes).toHaveLength(0);
      expect(error).toBeNull();
    });

    it("optimistically deletes and rolls back on failure", async () => {
      useNotesStore.setState({ notes: [{ ...mockNote }] });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(null, { status: 500 }),
      );

      await act(async () => {
        await useNotesStore.getState().deleteNote("1");
      });

      const { notes, error } = useNotesStore.getState();
      expect(notes).toHaveLength(1); // rolled back
      expect(error).toBe("Failed to delete note");
    });
  });
});
