import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import NotesList from "../NotesList";
import type { Note } from "@/types/note";

vi.mock("next/link", () => ({
  default: function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  },
}));

const mockNotes: Note[] = [
  {
    id: "1",
    title: "First Note",
    content: "First content",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    tags: [
      {
        id: "t1",
        name: "Work",
        color: "#FF0000",
        createdAt: "",
        updatedAt: "",
      },
    ],
    categoryId: "c1",
    category: {
      id: "c1",
      name: "Projects",
      color: "#10B981",
      createdAt: "",
      updatedAt: "",
    },
  },
  {
    id: "2",
    title: "Second Note",
    content: "Second content",
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-04T00:00:00.000Z",
    tags: [],
    categoryId: null,
    category: null,
  },
];

const mockFetchNotes = vi.fn();
const mockSetSearch = vi.fn();
const mockSetFilterTagIds = vi.fn();
const mockSetFilterCategoryId = vi.fn();
const mockResetAllFilters = vi.fn();

let mockNotesStoreState = {
  notes: mockNotes,
  isLoading: false,
  search: "",
  filterTagIds: [] as string[],
  filterCategoryId: null as string | null,
  fetchNotes: mockFetchNotes,
  setSearch: mockSetSearch,
  setFilterTagIds: mockSetFilterTagIds,
  setFilterCategoryId: mockSetFilterCategoryId,
  resetAllFilters: mockResetAllFilters,
};

vi.mock("@/stores/notes-store", () => ({
  useNotesStore: () => mockNotesStoreState,
}));

const mockFetchTags = vi.fn();

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
      {
        id: "t2",
        name: "Personal",
        color: "#00FF00",
        createdAt: "",
        updatedAt: "",
        _count: { notes: 1 },
      },
    ],
    fetchTags: mockFetchTags,
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
  mockNotesStoreState = {
    notes: mockNotes,
    isLoading: false,
    search: "",
    filterTagIds: [],
    filterCategoryId: null,
    fetchNotes: mockFetchNotes,
    setSearch: mockSetSearch,
    setFilterTagIds: mockSetFilterTagIds,
    setFilterCategoryId: mockSetFilterCategoryId,
    resetAllFilters: mockResetAllFilters,
  };
});

describe("NotesList", () => {
  it("should render note cards", () => {
    render(<NotesList />);
    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();
  });

  it("should fetch notes, tags, and categories on mount", () => {
    render(<NotesList />);
    expect(mockFetchNotes).toHaveBeenCalled();
    expect(mockFetchTags).toHaveBeenCalled();
    expect(mockFetchCategories).toHaveBeenCalled();
  });

  it("should render CategoryFilter", () => {
    render(<NotesList />);
    expect(
      screen.getByRole("group", { name: "Filter by category" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Filter by category Projects" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Filter by category Ideas" }),
    ).toBeInTheDocument();
  });

  it("should render TagFilter", () => {
    render(<NotesList />);
    expect(
      screen.getByRole("group", { name: "Filter by tags" }),
    ).toBeInTheDocument();
  });

  it("should render SearchBar", () => {
    render(<NotesList />);
    expect(screen.getByLabelText("Search notes")).toBeInTheDocument();
  });

  it("should call setFilterCategoryId when category filter clicked", () => {
    render(<NotesList />);
    fireEvent.click(
      screen.getByRole("button", { name: "Filter by category Projects" }),
    );
    expect(mockSetFilterCategoryId).toHaveBeenCalledWith("c1");
  });

  it("should call resetAllFilters when All clicked", () => {
    render(<NotesList />);
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(mockResetAllFilters).toHaveBeenCalled();
  });

  it("should show category note counts", () => {
    render(<NotesList />);
    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  it("should show empty state when no notes", () => {
    mockNotesStoreState = {
      ...mockNotesStoreState,
      notes: [],
    };
    render(<NotesList />);
    expect(screen.getByText("No notes found")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first note to get started"),
    ).toBeInTheDocument();
  });

  it("should show filter hint in empty state when filters active", () => {
    mockNotesStoreState = {
      ...mockNotesStoreState,
      notes: [],
      filterCategoryId: "c1",
    };
    render(<NotesList />);
    expect(screen.getByText("No notes found")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search or filters"),
    ).toBeInTheDocument();
  });

  it("should show Create Note link when no filters and no notes", () => {
    mockNotesStoreState = {
      ...mockNotesStoreState,
      notes: [],
    };
    render(<NotesList />);
    const createLink = screen.getByRole("link", { name: "Create Note" });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/dashboard/notes/new");
  });

  it("should not show Create Note link when filters active and no notes", () => {
    mockNotesStoreState = {
      ...mockNotesStoreState,
      notes: [],
      filterCategoryId: "c1",
    };
    render(<NotesList />);
    expect(screen.queryByRole("link", { name: "Create Note" })).not.toBeInTheDocument();
  });

  it("should show spinner when loading with no notes", () => {
    mockNotesStoreState = {
      ...mockNotesStoreState,
      notes: [],
      isLoading: true,
    };
    render(<NotesList />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should render category badge on note card", () => {
    render(<NotesList />);
    const projectsElements = screen.getAllByText("Projects");
    expect(projectsElements.length).toBeGreaterThanOrEqual(2);
    const badge = projectsElements.find(
      (el) => el.tagName === "SPAN" && el.closest("article") !== null,
    );
    expect(badge).toBeDefined();
  });
});
