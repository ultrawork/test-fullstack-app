import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import NoteEditor from "../NoteEditor";
import type { Note } from "@/types/note";

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

const mockCreateNote = vi.fn();
const mockUpdateNote = vi.fn();

vi.mock("@/stores/notes-store", () => ({
  useNotesStore: () => ({
    createNote: mockCreateNote,
    updateNote: mockUpdateNote,
  }),
}));

const mockFetchTags = vi.fn();
const mockCreateTag = vi.fn();

vi.mock("@/stores/tags-store", () => ({
  useTagsStore: () => ({
    tags: [
      {
        id: "t1",
        name: "Work",
        color: "#FF0000",
        createdAt: "",
        updatedAt: "",
        _count: { notes: 2 },
      },
    ],
    fetchTags: mockFetchTags,
    createTag: mockCreateTag,
  }),
}));

const mockFetchCategories = vi.fn();

vi.mock("@/stores/categories-store", () => ({
  useCategoriesStore: () => ({
    categories: [
      {
        id: "c1",
        name: "Projects",
        color: "#10B981",
        createdAt: "",
        updatedAt: "",
        _count: { notes: 3 },
      },
      {
        id: "c2",
        name: "Ideas",
        color: "#8B5CF6",
        createdAt: "",
        updatedAt: "",
        _count: { notes: 1 },
      },
    ],
    fetchCategories: mockFetchCategories,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockNote: Note = {
  id: "note-1",
  title: "Existing Note",
  content: "Existing content",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
  tags: [
    { id: "t1", name: "Work", color: "#FF0000", createdAt: "", updatedAt: "" },
  ],
  categoryId: "c1",
  category: {
    id: "c1",
    name: "Projects",
    color: "#10B981",
    createdAt: "",
    updatedAt: "",
  },
};

describe("NoteEditor", () => {
  beforeEach(() => {
    mockCreateNote.mockResolvedValue({ id: "new-1" });
    mockUpdateNote.mockResolvedValue(undefined);
    mockCreateTag.mockResolvedValue({
      id: "t-new",
      name: "New",
      color: "#3B82F6",
      createdAt: "",
      updatedAt: "",
    });
  });

  it("should render form fields", () => {
    render(<NoteEditor />);
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Content")).toBeInTheDocument();
  });

  it("should render CategorySelect with categories", () => {
    render(<NoteEditor />);
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByText("No category")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Ideas")).toBeInTheDocument();
  });

  it("should fetch tags and categories on mount", () => {
    render(<NoteEditor />);
    expect(mockFetchTags).toHaveBeenCalled();
    expect(mockFetchCategories).toHaveBeenCalled();
  });

  it("should render Create Note button for new note", () => {
    render(<NoteEditor />);
    expect(
      screen.getByRole("button", { name: "Create Note" }),
    ).toBeInTheDocument();
  });

  it("should render Update Note button for existing note", () => {
    render(<NoteEditor note={mockNote} />);
    expect(
      screen.getByRole("button", { name: "Update Note" }),
    ).toBeInTheDocument();
  });

  it("should populate fields when editing existing note", () => {
    render(<NoteEditor note={mockNote} />);
    expect(screen.getByLabelText("Title")).toHaveValue("Existing Note");
    expect(screen.getByLabelText("Content")).toHaveValue("Existing content");
  });

  it("should pre-select category when editing existing note", () => {
    render(<NoteEditor note={mockNote} />);
    const select = screen.getByLabelText("Category") as HTMLSelectElement;
    expect(select.value).toBe("c1");
  });

  it("should allow selecting a category", () => {
    render(<NoteEditor />);
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "c2" },
    });
    const select = screen.getByLabelText("Category") as HTMLSelectElement;
    expect(select.value).toBe("c2");
  });

  it("should allow clearing category selection", () => {
    render(<NoteEditor note={mockNote} />);
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "" },
    });
    const select = screen.getByLabelText("Category") as HTMLSelectElement;
    expect(select.value).toBe("");
  });

  it("should show validation error for empty title", async () => {
    render(<NoteEditor />);
    fireEvent.change(screen.getByLabelText("Content"), {
      target: { value: "Some content" },
    });
    const form = screen.getByLabelText("Title").closest("form")!;
    fireEvent.submit(form);
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(mockCreateNote).not.toHaveBeenCalled();
  });

  it("should show validation error for empty content", async () => {
    render(<NoteEditor />);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Some title" },
    });
    const form = screen.getByLabelText("Title").closest("form")!;
    fireEvent.submit(form);
    expect(await screen.findByText("Content is required")).toBeInTheDocument();
    expect(mockCreateNote).not.toHaveBeenCalled();
  });

  it("should submit new note with selected category", async () => {
    render(<NoteEditor />);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Note" },
    });
    fireEvent.change(screen.getByLabelText("Content"), {
      target: { value: "Note content" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "c2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Note" }));

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith({
        title: "New Note",
        content: "Note content",
        tagIds: [],
        categoryId: "c2",
      });
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/notes/new-1");
    });
  });

  it("should submit new note without category", async () => {
    render(<NoteEditor />);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Note" },
    });
    fireEvent.change(screen.getByLabelText("Content"), {
      target: { value: "Note content" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Note" }));

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith({
        title: "New Note",
        content: "Note content",
        tagIds: [],
        categoryId: undefined,
      });
    });
  });

  it("should submit updated note with changed category", async () => {
    render(<NoteEditor note={mockNote} />);
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "c2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Note" }));

    await waitFor(() => {
      expect(mockUpdateNote).toHaveBeenCalledWith("note-1", {
        title: "Existing Note",
        content: "Existing content",
        tagIds: ["t1"],
        categoryId: "c2",
      });
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/notes/note-1");
    });
  });

  it("should show error on failed submission", async () => {
    mockCreateNote.mockRejectedValue(new Error("Server error"));
    render(<NoteEditor />);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Title" },
    });
    fireEvent.change(screen.getByLabelText("Content"), {
      target: { value: "Content" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Note" }));

    expect(
      await screen.findByText("Failed to save note"),
    ).toBeInTheDocument();
  });

  it("should navigate back on Cancel", () => {
    render(<NoteEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockBack).toHaveBeenCalled();
  });

  it("should render TagSelector", () => {
    render(<NoteEditor />);
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });
});
