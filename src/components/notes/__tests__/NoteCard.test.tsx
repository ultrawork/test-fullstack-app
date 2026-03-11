import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { NoteCard } from "../NoteCard";
import type { Note } from "@/types/note";

afterEach(() => {
  cleanup();
});

const mockNote: Note = {
  id: "1",
  title: "Тестовая заметка",
  content: "Содержимое тестовой заметки",
  createdAt: "2025-01-15T10:00:00.000Z",
  updatedAt: "2025-01-15T10:00:00.000Z",
};

describe("NoteCard", () => {
  it("renders note title and content", () => {
    render(<NoteCard note={mockNote} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Тестовая заметка" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Содержимое тестовой заметки")).toBeInTheDocument();
  });

  it("renders as article element", () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("truncates content longer than 150 characters", () => {
    const longNote: Note = {
      ...mockNote,
      content: "А".repeat(200),
    };
    render(<NoteCard note={longNote} />);

    const paragraph = screen.getByText(/^А+…$/);
    expect(paragraph.textContent).toHaveLength(151);
  });
});
