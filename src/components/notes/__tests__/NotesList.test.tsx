import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import NotesList from "../NotesList";
import type { Note } from "@/types/note";

afterEach(() => {
  cleanup();
});

const mockNotes: Note[] = [
  {
    id: "1",
    title: "First Note",
    content: "Content 1",
    userId: "u1",
    categoryId: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Second Note",
    content: "Content 2",
    userId: "u1",
    categoryId: null,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
];

describe("NotesList", () => {
  it("renders list of notes", () => {
    render(<NotesList notes={mockNotes} isLoading={false} />);
    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();
  });

  it("renders empty state when no notes", () => {
    render(<NotesList notes={[]} isLoading={false} />);
    expect(screen.getByText("No notes yet")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first note to get started."),
    ).toBeInTheDocument();
  });

  it("shows loading spinner", () => {
    render(<NotesList notes={[]} isLoading={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders create note link in empty state", () => {
    render(<NotesList notes={[]} isLoading={false} />);
    expect(
      screen.getByRole("link", { name: "Create Note" }),
    ).toBeInTheDocument();
  });
});
