import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import SearchBar from "../SearchBar";

afterEach(() => {
  cleanup();
});

describe("SearchBar", () => {
  it("should render search input", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Search notes")).toBeInTheDocument();
  });

  it("should display current value", () => {
    render(<SearchBar value="test" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Search notes")).toHaveValue("test");
  });

  it("should call onChange after debounce", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} debounceMs={300} />);

    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "hello" },
    });

    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(onChange).toHaveBeenCalledWith("hello");
    vi.useRealTimers();
  });

  it("should debounce multiple changes", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} debounceMs={300} />);

    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "h" },
    });
    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "he" },
    });
    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "hel" },
    });

    vi.advanceTimersByTime(300);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("hel");
    vi.useRealTimers();
  });
});
