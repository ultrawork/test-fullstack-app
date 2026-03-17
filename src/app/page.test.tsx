import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import HomePage from "./page";

afterEach(() => {
  cleanup();
});

describe("HomePage", () => {
  it("renders the heading", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Notes App" }),
    ).toBeInTheDocument();
  });

  it("renders main element", () => {
    render(<HomePage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders a search field labeled for notes", () => {
    render(<HomePage />);
    expect(screen.getByLabelText("Search notes")).toBeInTheDocument();
  });

  it("filters notes by title using a case-insensitive query", () => {
    render(<HomePage />);

    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "SHOP" },
    });

    expect(screen.getByText("Shopping list")).toBeInTheDocument();
    expect(screen.queryByText("First Note")).not.toBeInTheDocument();
    expect(screen.queryByText("Work plan")).not.toBeInTheDocument();
  });

  it("shows all notes when the search query contains only surrounding whitespace", () => {
    render(<HomePage />);

    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "  work  " },
    });

    expect(screen.getByText("Work plan")).toBeInTheDocument();
    expect(screen.queryByText("First Note")).not.toBeInTheDocument();
    expect(screen.queryByText("Shopping list")).not.toBeInTheDocument();
  });

  it("renders an empty list when no note titles match the query", () => {
    render(<HomePage />);

    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "unknown" },
    });

    expect(screen.getByRole("list")).toBeEmptyDOMElement();
  });
});
