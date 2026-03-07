import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import NoteCard from "../NoteCard";
import type { Note } from "@/types/note";

afterEach(() => {
  cleanup();
});

const mockNote: Note = {
  id: "note-1",
  title: "Test Note",
  content: "This is test content for the note card",
  userId: "user-1",
  categoryId: "cat-1",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
  category: { id: "cat-1", name: "Work", color: "#3B82F6" },
};

describe("NoteCard", () => {
  it("renders note title", () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });

  it("renders note content preview", () => {
    render(<NoteCard note={mockNote} />);
    expect(
      screen.getByText("This is test content for the note card"),
    ).toBeInTheDocument();
  });

  it("renders category badge when category exists", () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("does not render category badge when no category", () => {
    const noteWithoutCategory = {
      ...mockNote,
      category: null,
      categoryId: null,
    };
    render(<NoteCard note={noteWithoutCategory} />);
    expect(screen.queryByText("Work")).not.toBeInTheDocument();
  });

  it("renders a link to the note", () => {
    render(<NoteCard note={mockNote} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/dashboard/notes/note-1");
  });

  it("renders date", () => {
    render(<NoteCard note={mockNote} />);
    const timeEl = screen.getByRole("article").querySelector("time");
    expect(timeEl).toBeInTheDocument();
    expect(timeEl).toHaveAttribute("datetime", "2024-01-02T00:00:00Z");
  });
});
