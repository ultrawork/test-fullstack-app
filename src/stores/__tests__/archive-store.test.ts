import { describe, it, expect, beforeEach, vi } from "vitest";
import { useArchiveStore } from "../archive-store";
import { act } from "@testing-library/react";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  act(() => {
    useArchiveStore.setState({ archivedNotes: [] });
  });
  mockFetch.mockReset();
});

describe("useArchiveStore", () => {
  it("starts with empty archived notes", () => {
    const { archivedNotes } = useArchiveStore.getState();
    expect(archivedNotes).toEqual([]);
  });

  it("archives a note via API", async () => {
    const mockItem = {
      id: "1",
      title: "Test",
      content: "Content",
      archivedAt: "2024-01-01T00:00:00.000Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockItem }),
    });

    await act(async () => {
      await useArchiveStore.getState().archiveNote("1", "Test", "Content");
    });

    const { archivedNotes } = useArchiveStore.getState();
    expect(archivedNotes).toHaveLength(1);
    expect(archivedNotes[0].id).toBe("1");
  });

  it("does not archive duplicate notes", async () => {
    act(() => {
      useArchiveStore.setState({
        archivedNotes: [
          {
            id: "1",
            title: "Existing",
            content: "Content",
            archivedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      });
    });

    await act(async () => {
      await useArchiveStore.getState().archiveNote("1", "Duplicate", "Content");
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(useArchiveStore.getState().archivedNotes).toHaveLength(1);
  });

  it("restores a note via API", async () => {
    act(() => {
      useArchiveStore.setState({
        archivedNotes: [
          {
            id: "1",
            title: "To Restore",
            content: "Content",
            archivedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      });
    });

    mockFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await useArchiveStore.getState().restoreNote("1");
    });

    expect(useArchiveStore.getState().archivedNotes).toHaveLength(0);
  });

  it("restores a note when server returns 404", async () => {
    act(() => {
      useArchiveStore.setState({
        archivedNotes: [
          {
            id: "1",
            title: "To Restore",
            content: "Content",
            archivedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      });
    });

    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    await act(async () => {
      await useArchiveStore.getState().restoreNote("1");
    });

    expect(useArchiveStore.getState().archivedNotes).toHaveLength(0);
  });

  it("checks if note is archived", () => {
    act(() => {
      useArchiveStore.setState({
        archivedNotes: [
          {
            id: "1",
            title: "Archived",
            content: "Content",
            archivedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      });
    });

    expect(useArchiveStore.getState().isArchived("1")).toBe(true);
    expect(useArchiveStore.getState().isArchived("2")).toBe(false);
  });

  it("fetches archived notes from API", async () => {
    const mockItems = [
      {
        id: "1",
        title: "A",
        content: "Content A",
        archivedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "2",
        title: "B",
        content: "Content B",
        archivedAt: "2024-01-02T00:00:00.000Z",
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockItems }),
    });

    await act(async () => {
      await useArchiveStore.getState().fetchArchived();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/notes/archived");
    expect(useArchiveStore.getState().archivedNotes).toEqual(mockItems);
  });

  it("handles network error in archiveNote gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      await useArchiveStore.getState().archiveNote("1", "Test", "Content");
    });

    expect(useArchiveStore.getState().archivedNotes).toHaveLength(0);
  });

  it("handles network error in restoreNote gracefully", async () => {
    act(() => {
      useArchiveStore.setState({
        archivedNotes: [
          {
            id: "1",
            title: "Keep",
            content: "Content",
            archivedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      });
    });

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      await useArchiveStore.getState().restoreNote("1");
    });

    expect(useArchiveStore.getState().archivedNotes).toHaveLength(1);
  });

  it("handles network error in fetchArchived gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      await useArchiveStore.getState().fetchArchived();
    });

    expect(useArchiveStore.getState().archivedNotes).toEqual([]);
  });
});
