import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import FavoriteCard from "../FavoriteCard";
import { useFavoritesStore } from "@/stores/favorites-store";
import { act } from "@testing-library/react";
import type { FavoriteItem } from "@/types/favorite";

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

const mockItem: FavoriteItem = {
  id: "1",
  title: "Test Note",
  createdAt: "2024-01-15T10:30:00.000Z",
};

describe("FavoriteCard", () => {
  it("renders item title", () => {
    render(<FavoriteCard item={mockItem} />);
    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });

  it("renders as article element", () => {
    render(<FavoriteCard item={mockItem} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("has delete button with aria-label", () => {
    render(<FavoriteCard item={mockItem} />);
    const button = screen.getByRole("button", {
      name: 'Удалить "Test Note" из избранного',
    });
    expect(button).toBeInTheDocument();
  });

  it("calls removeFavorite on delete click", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({ ok: true });

    act(() => {
      useFavoritesStore.setState({
        favorites: [mockItem],
      });
    });

    render(<FavoriteCard item={mockItem} />);
    const button = screen.getByRole("button", {
      name: 'Удалить "Test Note" из избранного',
    });

    await user.click(button);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/favorites/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
