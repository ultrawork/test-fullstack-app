import { render, screen, cleanup, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import SearchBar from "../SearchBar";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("SearchBar", () => {
  it("renders search input", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search notes...")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Find..." />);
    expect(screen.getByPlaceholderText("Find...")).toBeInTheDocument();
  });

  it("calls onSearch after debounce", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText("Search notes...");

    act(() => {
      // Simulate a native change event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )!.set!;
      nativeInputValueSetter.call(input, "test");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledWith("test");
  });

  it("has accessible label", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByLabelText("Search notes")).toBeInTheDocument();
  });
});
