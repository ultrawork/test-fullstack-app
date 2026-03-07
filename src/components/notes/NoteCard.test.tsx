import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import NoteCard from "./NoteCard";
import type { NoteDTO } from "@/types";

afterEach(() => {
  cleanup();
});

const mockNote: NoteDTO = {
  id: "n1",
  title: "Test Note",
  content: "Test content here",
  userId: "u1",
  createdAt: "2024-01-15T00:00:00.000Z",
  updatedAt: "2024-01-15T00:00:00.000Z",
  tags: [
    {
      id: "t1",
      name: "Work",
      color: "#3B82F6",
      userId: "u1",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ],
};

describe("NoteCard", () => {
  it("renders note title and content", () => {
    render(<NoteCard note={mockNote} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("Test content here")).toBeInTheDocument();
  });

  it("renders tag badges", () => {
    render(<NoteCard note={mockNote} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("does not render tags section when no tags", () => {
    const noteWithoutTags = { ...mockNote, tags: [] };
    render(
      <NoteCard note={noteWithoutTags} onEdit={() => {}} onDelete={() => {}} />
    );
    expect(screen.queryByText("Work")).not.toBeInTheDocument();
  });

  it("calls onEdit when edit button clicked", async () => {
    const onEdit = vi.fn();
    render(<NoteCard note={mockNote} onEdit={onEdit} onDelete={() => {}} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Edit note Test Note" })
    );
    expect(onEdit).toHaveBeenCalledWith(mockNote);
  });

  it("calls onDelete when delete button clicked", async () => {
    const onDelete = vi.fn();
    render(<NoteCard note={mockNote} onEdit={() => {}} onDelete={onDelete} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Delete note Test Note" })
    );
    expect(onDelete).toHaveBeenCalledWith("n1");
  });
});
