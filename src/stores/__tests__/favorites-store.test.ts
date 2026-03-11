import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFavoritesStore } from "../favorites-store";
import { act } from "@testing-library/react";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  act(() => {
    useFavoritesStore.setState({ favorites: [] });
  });
  mockFetch.mockReset();
});

describe("useFavoritesStore", () => {
  it("starts with empty favorites", () => {
    const { favorites } = useFavoritesStore.getState();
    expect(favorites).toEqual([]);
  });

  it("adds a favorite via API", async () => {
    const mockItem = {
      id: "1",
      title: "Test",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockItem }),
    });

    await act(async () => {
      await useFavoritesStore.getState().addFavorite("1", "Test");
    });

    const { favorites } = useFavoritesStore.getState();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].id).toBe("1");
  });

  it("does not add duplicate favorites", async () => {
    act(() => {
      useFavoritesStore.setState({
        favorites: [
          { id: "1", title: "Existing", createdAt: "2024-01-01T00:00:00.000Z" },
        ],
      });
    });

    await act(async () => {
      await useFavoritesStore.getState().addFavorite("1", "Duplicate");
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(useFavoritesStore.getState().favorites).toHaveLength(1);
  });

  it("removes a favorite via API", async () => {
    act(() => {
      useFavoritesStore.setState({
        favorites: [
          {
            id: "1",
            title: "To Remove",
            createdAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      });
    });

    mockFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await useFavoritesStore.getState().removeFavorite("1");
    });

    expect(useFavoritesStore.getState().favorites).toHaveLength(0);
  });

  it("checks if item is favorite", () => {
    act(() => {
      useFavoritesStore.setState({
        favorites: [
          { id: "1", title: "Fav", createdAt: "2024-01-01T00:00:00.000Z" },
        ],
      });
    });

    expect(useFavoritesStore.getState().isFavorite("1")).toBe(true);
    expect(useFavoritesStore.getState().isFavorite("2")).toBe(false);
  });

  it("clears all favorites via API", async () => {
    act(() => {
      useFavoritesStore.setState({
        favorites: [
          { id: "1", title: "A", createdAt: "2024-01-01T00:00:00.000Z" },
          { id: "2", title: "B", createdAt: "2024-01-02T00:00:00.000Z" },
        ],
      });
    });

    mockFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await useFavoritesStore.getState().clearFavorites();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/favorites", {
      method: "DELETE",
    });
    expect(useFavoritesStore.getState().favorites).toEqual([]);
  });

  it("handles network error in addFavorite gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      await useFavoritesStore.getState().addFavorite("1", "Test");
    });

    expect(useFavoritesStore.getState().favorites).toHaveLength(0);
  });

  it("handles network error in removeFavorite gracefully", async () => {
    act(() => {
      useFavoritesStore.setState({
        favorites: [
          { id: "1", title: "Keep", createdAt: "2024-01-01T00:00:00.000Z" },
        ],
      });
    });

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      await useFavoritesStore.getState().removeFavorite("1");
    });

    expect(useFavoritesStore.getState().favorites).toHaveLength(1);
  });

  it("handles network error in clearFavorites gracefully", async () => {
    act(() => {
      useFavoritesStore.setState({
        favorites: [
          { id: "1", title: "Keep", createdAt: "2024-01-01T00:00:00.000Z" },
        ],
      });
    });

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      await useFavoritesStore.getState().clearFavorites();
    });

    expect(useFavoritesStore.getState().favorites).toHaveLength(1);
  });
});
