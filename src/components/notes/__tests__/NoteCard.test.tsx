import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import NoteCard from "../NoteCard";
import type { Note } from "@/types/note";

vi.mock("next/link", () => {
  return {
    default: function MockLink({
      children,
      href,
    }: {
      children: React.ReactNode;
      href: string;
    }) {
      return <a href={href}>{children}</a>;
    },
  };
});

afterEach(() => {
  cleanup();
});

const mockNote: Note = {
  id: "1",
  title: "Test Note",
  content: "This is test content",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
  tags: [
    { id: "t1", name: "Work", color: "#FF0000", createdAt: "", updatedAt: "" },
    {
      id: "t2",
      name: "Urgent",
      color: "#0000FF",
      createdAt: "",
      updatedAt: "",
    },
  ],
  images: [],
};

describe("NoteCard", () => {
  it("should render note title", () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });

  it("should render note content", () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText("This is test content")).toBeInTheDocument();
  });

  it("should render tag badges", () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("should link to note detail page", () => {
    render(<NoteCard note={mockNote} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/dashboard/notes/1");
  });

  it("should render without tags", () => {
    const noteWithoutTags = { ...mockNote, tags: [] };
    render(<NoteCard note={noteWithoutTags} />);
    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });
});
