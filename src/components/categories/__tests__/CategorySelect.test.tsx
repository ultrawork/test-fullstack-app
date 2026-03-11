import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import CategorySelect from "../CategorySelect";
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
    _count: { notes: 2 },
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

describe("CategorySelect", () => {
  it("should render label", () => {
    render(
      <CategorySelect
        categories={mockCategories}
        selectedId={null}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
  });

  it("should render 'No category' option", () => {
    render(
      <CategorySelect
        categories={mockCategories}
        selectedId={null}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("No category")).toBeInTheDocument();
  });

  it("should render all categories as options", () => {
    render(
      <CategorySelect
        categories={mockCategories}
        selectedId={null}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("should call onChange with category id on selection", () => {
    const onChange = vi.fn();
    render(
      <CategorySelect
        categories={mockCategories}
        selectedId={null}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "c1" },
    });
    expect(onChange).toHaveBeenCalledWith("c1");
  });

  it("should call onChange with null when 'No category' selected", () => {
    const onChange = vi.fn();
    render(
      <CategorySelect
        categories={mockCategories}
        selectedId="c1"
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "" },
    });
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
