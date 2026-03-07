import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNotesStore } from "../notes-store";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api-client";

const mockedApi = vi.mocked(apiClient);

const mockNote = {
  id: "1",
  title: "Test Note",
  content: "Content",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  tags: [
    { id: "t1", name: "Work", color: "#FF0000", createdAt: "", updatedAt: "" },
  ],
};

describe("NotesStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotesStore.setState({
      notes: [],
      currentNote: null,
      isLoadingList: false,
      isLoadingNote: false,
      isSaving: false,
      isDeleting: false,
      error: null,
      search: "",
      filterTagIds: [],
    });
  });

  it("should have initial state", () => {
    const state = useNotesStore.getState();
    expect(state.notes).toEqual([]);
    expect(state.currentNote).toBeNull();
    expect(state.search).toBe("");
    expect(state.filterTagIds).toEqual([]);
  });

  it("should fetch notes", async () => {
    mockedApi.get.mockResolvedValueOnce({
      success: true,
      data: {
        notes: [mockNote],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    });

    await useNotesStore.getState().fetchNotes();

    expect(useNotesStore.getState().notes).toEqual([mockNote]);
  });

  it("should fetch notes with search and tag filter", async () => {
    useNotesStore.setState({ search: "test", filterTagIds: ["t1"] });
    mockedApi.get.mockResolvedValueOnce({
      success: true,
      data: {
        notes: [mockNote],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    });

    await useNotesStore.getState().fetchNotes();

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/notes?search=test&tagIds=t1",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("should create note", async () => {
    mockedApi.post.mockResolvedValueOnce({ success: true, data: mockNote });

    const result = await useNotesStore.getState().createNote({
      title: "Test Note",
      content: "Content",
      tagIds: ["t1"],
    });

    expect(result).toEqual(mockNote);
    expect(useNotesStore.getState().notes).toContainEqual(mockNote);
  });

  it("should update note", async () => {
    useNotesStore.setState({ notes: [mockNote] });
    const updated = { ...mockNote, title: "Updated" };
    mockedApi.put.mockResolvedValueOnce({ success: true, data: updated });

    await useNotesStore.getState().updateNote("1", { title: "Updated" });

    expect(useNotesStore.getState().notes[0].title).toBe("Updated");
  });

  it("should delete note", async () => {
    useNotesStore.setState({ notes: [mockNote] });
    mockedApi.delete.mockResolvedValueOnce({ success: true, data: null });

    await useNotesStore.getState().deleteNote("1");

    expect(useNotesStore.getState().notes).toEqual([]);
  });

  it("should set search", () => {
    useNotesStore.getState().setSearch("hello");
    expect(useNotesStore.getState().search).toBe("hello");
  });

  it("should set filter tag ids", () => {
    useNotesStore.getState().setFilterTagIds(["t1", "t2"]);
    expect(useNotesStore.getState().filterTagIds).toEqual(["t1", "t2"]);
  });

  it("should handle fetch error", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("Network error"));

    await useNotesStore.getState().fetchNotes();

    expect(useNotesStore.getState().error).toBe("Network error");
  });
});
