import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import TagFilter from "../TagFilter";
import type { Tag } from "@/types/tag";

afterEach(() => {
  cleanup();
});

const mockTags: Tag[] = [
  { id: "1", name: "Work", color: "#FF0000", createdAt: "", updatedAt: "" },
  { id: "2", name: "Personal", color: "#00FF00", createdAt: "", updatedAt: "" },
];

describe("TagFilter", () => {
  it("should render filter buttons for tags", () => {
    render(<TagFilter tags={mockTags} selectedIds={[]} onChange={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Filter by tag Work" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Filter by tag Personal" }),
    ).toBeInTheDocument();
  });

  it("should have group role", () => {
    render(<TagFilter tags={mockTags} selectedIds={[]} onChange={vi.fn()} />);
    expect(
      screen.getByRole("group", { name: "Filter by tags" }),
    ).toBeInTheDocument();
  });

  it("should toggle tag selection", () => {
    const onChange = vi.fn();
    render(<TagFilter tags={mockTags} selectedIds={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Filter by tag Work" }));
    expect(onChange).toHaveBeenCalledWith(["1"]);
  });

  it("should deselect tag", () => {
    const onChange = vi.fn();
    render(
      <TagFilter tags={mockTags} selectedIds={["1"]} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Filter by tag Work" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("should show clear button when tags selected", () => {
    render(
      <TagFilter tags={mockTags} selectedIds={["1"]} onChange={vi.fn()} />,
    );
    expect(
      screen.getByRole("button", { name: "Clear tag filter" }),
    ).toBeInTheDocument();
  });

  it("should clear all when clear clicked", () => {
    const onChange = vi.fn();
    render(
      <TagFilter
        tags={mockTags}
        selectedIds={["1", "2"]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear tag filter" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("should set aria-pressed on selected tags", () => {
    render(
      <TagFilter tags={mockTags} selectedIds={["1"]} onChange={vi.fn()} />,
    );
    expect(
      screen.getByRole("button", { name: "Filter by tag Work" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Filter by tag Personal" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("should return null for empty tags", () => {
    const { container } = render(
      <TagFilter tags={[]} selectedIds={[]} onChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
