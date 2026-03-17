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

  it("renders search input with accessible label", () => {
    render(<HomePage />);
    expect(screen.getByLabelText("Search notes")).toBeInTheDocument();
  });

  it("filters notes by title", () => {
    render(<HomePage />);

    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "shop" },
    });

    expect(screen.getByText("Shopping list")).toBeInTheDocument();
    expect(screen.queryByText("First Note")).not.toBeInTheDocument();
    expect(screen.queryByText("Work plan")).not.toBeInTheDocument();
  });

  it("filters notes by title case-insensitively", () => {
    render(<HomePage />);

    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "SHOP" },
    });

    expect(screen.getByText("Shopping list")).toBeInTheDocument();
    expect(screen.queryByText("First Note")).not.toBeInTheDocument();
    expect(screen.queryByText("Work plan")).not.toBeInTheDocument();
  });
});
