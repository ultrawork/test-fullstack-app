import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import TagList from "../TagList";
import type { TagWithNoteCount } from "@/types/tag";

afterEach(() => {
  cleanup();
});

const mockTags: TagWithNoteCount[] = [
  {
    id: "1",
    name: "Work",
    color: "#FF0000",
    createdAt: "",
    updatedAt: "",
    _count: { notes: 5 },
  },
  {
    id: "2",
    name: "Personal",
    color: "#00FF00",
    createdAt: "",
    updatedAt: "",
    _count: { notes: 1 },
  },
];

describe("TagList", () => {
  it("should render tags", () => {
    render(<TagList tags={mockTags} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("should show note counts", () => {
    render(<TagList tags={mockTags} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("5 notes")).toBeInTheDocument();
    expect(screen.getByText("1 note")).toBeInTheDocument();
  });

  it("should show edit and delete buttons", () => {
    render(<TagList tags={mockTags} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Edit tag Work" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete tag Work" }),
    ).toBeInTheDocument();
  });

  it("should call onEdit when edit clicked", () => {
    const onEdit = vi.fn();
    render(<TagList tags={mockTags} onEdit={onEdit} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit tag Work" }));
    expect(onEdit).toHaveBeenCalledWith(mockTags[0]);
  });

  it("should call onDelete when delete clicked", () => {
    const onDelete = vi.fn();
    render(<TagList tags={mockTags} onEdit={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete tag Work" }));
    expect(onDelete).toHaveBeenCalledWith(mockTags[0]);
  });

  it("should show empty message when no tags", () => {
    render(<TagList tags={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/No tags yet/)).toBeInTheDocument();
  });
});
