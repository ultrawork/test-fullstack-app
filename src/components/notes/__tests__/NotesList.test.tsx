import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { NotesList } from "../NotesList";
import { useNotesStore } from "@/stores/notes-store";
import type { Note } from "@/types/note";

vi.mock("@/stores/notes-store");

const mockFetchNotes = vi.fn();

const sampleNotes: Note[] = [
  {
    id: "1",
    title: "Заметка 1",
    content: "Содержимое 1",
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-15T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Заметка 2",
    content: "Содержимое 2",
    createdAt: "2025-01-16T10:00:00.000Z",
    updatedAt: "2025-01-16T10:00:00.000Z",
  },
];

beforeEach(() => {
  vi.mocked(useNotesStore).mockReturnValue({
    notes: sampleNotes,
    searchQuery: "",
    isLoading: false,
    error: null,
    setSearchQuery: vi.fn(),
    fetchNotes: mockFetchNotes,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("NotesList", () => {
  it("renders notes list with data-testid", () => {
    render(<NotesList />);
    expect(screen.getByTestId("notes-list")).toBeInTheDocument();
  });

  it("renders all notes", () => {
    render(<NotesList />);
    expect(screen.getByText("Заметка 1")).toBeInTheDocument();
    expect(screen.getByText("Заметка 2")).toBeInTheDocument();
  });

  it("shows 'Ничего не найдено' when search has no results", () => {
    vi.mocked(useNotesStore).mockReturnValue({
      notes: [],
      searchQuery: "несуществующий",
      isLoading: false,
      error: null,
      setSearchQuery: vi.fn(),
      fetchNotes: mockFetchNotes,
    });

    render(<NotesList />);
    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
  });

  it("shows 'Нет заметок' when there are no notes and no search", () => {
    vi.mocked(useNotesStore).mockReturnValue({
      notes: [],
      searchQuery: "",
      isLoading: false,
      error: null,
      setSearchQuery: vi.fn(),
      fetchNotes: mockFetchNotes,
    });

    render(<NotesList />);
    expect(screen.getByText("Нет заметок")).toBeInTheDocument();
  });

  it("has aria-live polite attribute", () => {
    render(<NotesList />);
    expect(screen.getByTestId("notes-list")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("calls fetchNotes on mount", () => {
    render(<NotesList />);
    expect(mockFetchNotes).toHaveBeenCalled();
  });
});
