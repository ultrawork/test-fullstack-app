import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import CategoryFilter from "../CategoryFilter";
import type { CategoryWithNoteCount } from "@/types/category";

afterEach(() => {
  cleanup();
});

const mockCategories: CategoryWithNoteCount[] = [
  {
    id: "c1",
    name: "Work",
    color: "#FF0000",
    createdAt: "",
    updatedAt: "",
    _count: { notes: 3 },
  },
  {
    id: "c2",
    name: "Personal",
    color: "#00FF00",
    createdAt: "",
    updatedAt: "",
    _count: { notes: 1 },
  },
];

describe("CategoryFilter", () => {
  it("should render 'All' button and category buttons", () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedId={null}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Filter by category Work" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Filter by category Personal" }),
    ).toBeInTheDocument();
  });

  it("should have group role", () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedId={null}
        onChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("group", { name: "Filter by category" }),
    ).toBeInTheDocument();
  });

  it("should select category on click", () => {
    const onChange = vi.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedId={null}
        onChange={onChange}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Filter by category Work" }),
    );
    expect(onChange).toHaveBeenCalledWith("c1");
  });

  it("should deselect category on second click", () => {
    const onChange = vi.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedId="c1"
        onChange={onChange}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Filter by category Work" }),
    );
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("should reset to all on 'All' click", () => {
    const onChange = vi.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedId="c1"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("should call onResetAll instead of onChange when 'All' clicked and onResetAll provided", () => {
    const onChange = vi.fn();
    const onResetAll = vi.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedId="c1"
        onChange={onChange}
        onResetAll={onResetAll}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onResetAll).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("should set aria-pressed on selected category", () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedId="c1"
        onChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Filter by category Work" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Filter by category Personal" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("should return null for empty categories", () => {
    const { container } = render(
      <CategoryFilter
        categories={[]}
        selectedId={null}
        onChange={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should show note counts", () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedId={null}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });
});
