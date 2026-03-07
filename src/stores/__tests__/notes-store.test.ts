import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNotesStore } from "../notes-store";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    getPaginated: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api-client";

const mockedApiClient = vi.mocked(apiClient);

const mockNote = {
  id: "note-1",
  title: "Test Note",
  content: "Content",
  userId: "user-1",
  categoryId: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("useNotesStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotesStore.setState({
      notes: [],
      selectedNote: null,
      filter: { page: 1, limit: 10 },
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  });

  it("should have initial state", () => {
    const state = useNotesStore.getState();
    expect(state.notes).toEqual([]);
    expect(state.selectedNote).toBeNull();
  });

  it("should fetch notes", async () => {
    mockedApiClient.getPaginated.mockResolvedValue({
      success: true,
      data: [mockNote],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    await useNotesStore.getState().fetchNotes();

    expect(useNotesStore.getState().notes).toEqual([mockNote]);
    expect(useNotesStore.getState().pagination.total).toBe(1);
  });

  it("should create a note", async () => {
    mockedApiClient.post.mockResolvedValue({
      success: true,
      data: mockNote,
    });

    const result = await useNotesStore.getState().createNote("Test Note", "Content");

    expect(result).toEqual(mockNote);
    expect(useNotesStore.getState().notes).toContainEqual(mockNote);
  });

  it("should update a note", async () => {
    useNotesStore.setState({ notes: [mockNote] });
    const updated = { ...mockNote, title: "Updated" };
    mockedApiClient.put.mockResolvedValue({
      success: true,
      data: updated,
    });

    const result = await useNotesStore
      .getState()
      .updateNote("note-1", { title: "Updated" });

    expect(result).toEqual(updated);
    expect(useNotesStore.getState().notes[0].title).toBe("Updated");
  });

  it("should delete a note", async () => {
    useNotesStore.setState({ notes: [mockNote] });
    mockedApiClient.delete.mockResolvedValue({ success: true });

    const result = await useNotesStore.getState().deleteNote("note-1");

    expect(result).toBe(true);
    expect(useNotesStore.getState().notes).toEqual([]);
  });

  it("should set filter", () => {
    useNotesStore.getState().setFilter({ search: "test", page: 2 });
    const filter = useNotesStore.getState().filter;
    expect(filter.search).toBe("test");
    expect(filter.page).toBe(2);
  });

  it("should handle fetch error", async () => {
    mockedApiClient.getPaginated.mockResolvedValue({
      success: false,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    await useNotesStore.getState().fetchNotes();
    expect(useNotesStore.getState().error).toBe("Failed to fetch notes");
  });

  it("should clear selected note", () => {
    useNotesStore.setState({ selectedNote: mockNote });
    useNotesStore.getState().clearSelectedNote();
    expect(useNotesStore.getState().selectedNote).toBeNull();
  });
});
