import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { SearchBar } from "../SearchBar";
import { useNotesStore } from "@/stores/notes-store";

vi.mock("@/stores/notes-store");

const mockSetSearchQuery = vi.fn();
const mockFetchNotes = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(useNotesStore).mockReturnValue({
    searchQuery: "",
    setSearchQuery: mockSetSearchQuery,
    fetchNotes: mockFetchNotes,
    notes: [],
    isLoading: false,
    error: null,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("SearchBar", () => {
  it("renders search input with data-testid", () => {
    render(<SearchBar />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("renders input with aria-label", () => {
    render(<SearchBar />);
    expect(screen.getByLabelText("Поиск заметок")).toBeInTheDocument();
  });

  it("renders label linked to input via htmlFor", () => {
    render(<SearchBar />);
    const input = screen.getByTestId("search-input");
    expect(input).toHaveAttribute("id", "notes-search");
  });

  it("renders inside a search element", () => {
    render(<SearchBar />);
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("debounces search calls by 300ms", () => {
    render(<SearchBar />);
    const input = screen.getByTestId("search-input");

    fireEvent.change(input, { target: { value: "test" } });

    expect(mockSetSearchQuery).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockSetSearchQuery).toHaveBeenCalledWith("test");
    expect(mockFetchNotes).toHaveBeenCalledWith("test");
  });

  it("does not call search before debounce period", () => {
    render(<SearchBar />);
    const input = screen.getByTestId("search-input");

    fireEvent.change(input, { target: { value: "a" } });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockSetSearchQuery).not.toHaveBeenCalled();
  });

  it("shows clear button when input has value", () => {
    render(<SearchBar />);

    expect(
      screen.queryByRole("button", { name: "Очистить поиск" }),
    ).not.toBeInTheDocument();

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "test" } });

    expect(
      screen.getByRole("button", { name: "Очистить поиск" }),
    ).toBeInTheDocument();
  });

  it("clears input and triggers fetch on clear button click", () => {
    render(<SearchBar />);
    const input = screen.getByTestId("search-input");

    fireEvent.change(input, { target: { value: "test" } });

    const clearButton = screen.getByRole("button", { name: "Очистить поиск" });
    fireEvent.click(clearButton);

    expect(input).toHaveValue("");
    expect(mockSetSearchQuery).toHaveBeenCalledWith("");
    expect(mockFetchNotes).toHaveBeenCalledWith("");
  });

  it("has placeholder text", () => {
    render(<SearchBar />);
    expect(
      screen.getByPlaceholderText("Поиск заметок..."),
    ).toBeInTheDocument();
  });
});
