import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import NoteEditor from "../NoteEditor";

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

vi.mock("@/stores/notes-store", () => ({
  useNotesStore: () => ({
    createNote: vi.fn().mockResolvedValue({ id: "new-1" }),
    updateNote: vi.fn().mockResolvedValue(undefined),
    uploadImages: vi.fn().mockResolvedValue(undefined),
    deleteImage: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("@/stores/tags-store", () => ({
  useTagsStore: () => ({
    tags: [],
    fetchTags: vi.fn(),
    createTag: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

describe("NoteEditor character counter", () => {
  it("should show '0 characters' when content is empty", () => {
    render(<NoteEditor />);
    const counter = screen.getByTestId("char-counter");
    expect(counter).toHaveTextContent("0 characters");
  });

  it("should update character count when typing", () => {
    render(<NoteEditor />);

    const textarea = screen.getByLabelText("Content");
    fireEvent.change(textarea, { target: { value: "Hello" } });

    const counter = screen.getByTestId("char-counter");
    expect(counter).toHaveTextContent("5 characters");
  });

  it("should show singular '1 character' form", () => {
    render(<NoteEditor />);

    const textarea = screen.getByLabelText("Content");
    fireEvent.change(textarea, { target: { value: "A" } });

    const counter = screen.getByTestId("char-counter");
    expect(counter).toHaveTextContent("1 character");
    expect(counter.textContent).not.toContain("1 characters");
  });

  it("should have aria-live attribute for accessibility", () => {
    render(<NoteEditor />);
    const counter = screen.getByTestId("char-counter");
    expect(counter).toHaveAttribute("aria-live", "polite");
  });
});
