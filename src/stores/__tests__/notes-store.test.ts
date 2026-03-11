import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useNotesStore } from "../notes-store";

const mockNotes = [
  {
    id: "1",
    title: "Test Note",
    content: "Test content",
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-15T10:00:00.000Z",
  },
];

beforeEach(() => {
  useNotesStore.setState({
    notes: [],
    searchQuery: "",
    isLoading: false,
    error: null,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useNotesStore", () => {
  it("fetches notes successfully", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { notes: mockNotes, total: 1 },
      }),
    } as Response);

    await useNotesStore.getState().fetchNotes();

    expect(useNotesStore.getState().notes).toEqual(mockNotes);
    expect(useNotesStore.getState().isLoading).toBe(false);
    expect(useNotesStore.getState().error).toBeNull();
  });

  it("fetches notes with search query", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { notes: mockNotes, total: 1 },
      }),
    } as Response);

    await useNotesStore.getState().fetchNotes("test");

    expect(global.fetch).toHaveBeenCalledWith("/api/v1/notes?search=test");
  });

  it("handles fetch error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await useNotesStore.getState().fetchNotes();

    expect(useNotesStore.getState().error).toBe("Ошибка загрузки: 500");
    expect(useNotesStore.getState().isLoading).toBe(false);
  });

  it("sets loading state during fetch", async () => {
    let resolvePromise: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });

    vi.spyOn(global, "fetch").mockReturnValueOnce(fetchPromise);

    const fetchNotesPromise = useNotesStore.getState().fetchNotes();

    expect(useNotesStore.getState().isLoading).toBe(true);

    resolvePromise!({
      ok: true,
      json: async () => ({
        success: true,
        data: { notes: [], total: 0 },
      }),
    } as Response);

    await fetchNotesPromise;

    expect(useNotesStore.getState().isLoading).toBe(false);
  });
});
