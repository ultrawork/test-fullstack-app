import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import FavoritesPage from "../page";
import { useFavoritesStore } from "@/stores/favorites-store";
import { act } from "@testing-library/react";

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  act(() => {
    useFavoritesStore.setState({ favorites: [] });
  });
  mockFetch.mockReset();
});

describe("FavoritesPage", () => {
  it("renders heading", () => {
    render(<FavoritesPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Избранное" }),
    ).toBeInTheDocument();
  });

  it("renders main element", () => {
    render(<FavoritesPage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("shows empty state when no favorites", () => {
    render(<FavoritesPage />);
    expect(screen.getByText("Список избранного пуст")).toBeInTheDocument();
  });

  it("shows favorites list when items exist", () => {
    act(() => {
      useFavoritesStore.setState({
        favorites: [
          { id: "1", title: "Note 1", createdAt: "2024-01-01T00:00:00.000Z" },
          { id: "2", title: "Note 2", createdAt: "2024-01-02T00:00:00.000Z" },
        ],
      });
    });

    render(<FavoritesPage />);
    expect(screen.getByText("Note 1")).toBeInTheDocument();
    expect(screen.getByText("Note 2")).toBeInTheDocument();
  });

  it("shows clear button when favorites exist", () => {
    act(() => {
      useFavoritesStore.setState({
        favorites: [{ id: "1", title: "Note 1", createdAt: "2024-01-01T00:00:00.000Z" }],
      });
    });

    render(<FavoritesPage />);
    expect(
      screen.getByRole("button", { name: "Очистить все избранные записи" }),
    ).toBeInTheDocument();
  });

  it("does not show clear button when no favorites", () => {
    render(<FavoritesPage />);
    expect(
      screen.queryByRole("button", { name: "Очистить все избранные записи" }),
    ).not.toBeInTheDocument();
  });
});
