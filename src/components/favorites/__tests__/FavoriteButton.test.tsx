import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import FavoriteButton from "../FavoriteButton";
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

describe("FavoriteButton", () => {
  it("renders with aria-pressed=false when not favorite", () => {
    render(<FavoriteButton id="1" title="Test" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("aria-label", 'Добавить "Test" в избранное');
  });

  it("renders with aria-pressed=true when is favorite", () => {
    act(() => {
      useFavoritesStore.setState({
        favorites: [
          { id: "1", title: "Test", createdAt: "2024-01-01T00:00:00.000Z" },
        ],
      });
    });

    render(<FavoriteButton id="1" title="Test" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute(
      "aria-label",
      'Удалить "Test" из избранного',
    );
  });

  it("toggles favorite on click", async () => {
    const user = userEvent.setup();
    const mockItem = {
      id: "1",
      title: "Test",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockItem }),
    });

    render(<FavoriteButton id="1" title="Test" />);
    const button = screen.getByRole("button");

    await user.click(button);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/favorites",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
