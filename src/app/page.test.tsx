import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import HomePage from "./page";

vi.mock("@/stores/notes-store", () => ({
  useNotesStore: vi.fn(() => ({
    notes: [],
    searchQuery: "",
    isLoading: false,
    error: null,
    setSearchQuery: vi.fn(),
    fetchNotes: vi.fn(),
  })),
}));

afterEach(() => {
  cleanup();
});

describe("HomePage", () => {
  it("renders the heading", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Notes App" }),
    ).toBeInTheDocument();
  });

  it("renders main element", () => {
    render(<HomePage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders header element", () => {
    render(<HomePage />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<HomePage />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("renders notes list", () => {
    render(<HomePage />);
    expect(screen.getByTestId("notes-list")).toBeInTheDocument();
  });
});
