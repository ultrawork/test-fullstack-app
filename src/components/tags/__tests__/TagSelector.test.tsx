import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import TagSelector from "../TagSelector";
import type { Tag } from "@/types/tag";

afterEach(() => {
  cleanup();
});

const mockTags: Tag[] = [
  { id: "1", name: "Work", color: "#FF0000", createdAt: "", updatedAt: "" },
  { id: "2", name: "Personal", color: "#00FF00", createdAt: "", updatedAt: "" },
  { id: "3", name: "Urgent", color: "#0000FF", createdAt: "", updatedAt: "" },
];

describe("TagSelector", () => {
  it("should render all tags as checkboxes", () => {
    render(<TagSelector tags={mockTags} selectedIds={[]} onChange={vi.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
  });

  it("should show selected tags as checked", () => {
    render(
      <TagSelector tags={mockTags} selectedIds={["1"]} onChange={vi.fn()} />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it("should call onChange when tag toggled", () => {
    const onChange = vi.fn();
    render(
      <TagSelector tags={mockTags} selectedIds={[]} onChange={onChange} />,
    );
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(onChange).toHaveBeenCalledWith(["1"]);
  });

  it("should remove tag from selection", () => {
    const onChange = vi.fn();
    render(
      <TagSelector tags={mockTags} selectedIds={["1"]} onChange={onChange} />,
    );
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("should filter tags by search", () => {
    render(<TagSelector tags={mockTags} selectedIds={[]} onChange={vi.fn()} />);
    const searchInput = screen.getByLabelText("Search tags");
    fireEvent.change(searchInput, { target: { value: "Work" } });
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  });

  it("should show create button for new tag name", () => {
    const onCreate = vi.fn();
    render(
      <TagSelector
        tags={mockTags}
        selectedIds={[]}
        onChange={vi.fn()}
        onCreate={onCreate}
      />,
    );
    const searchInput = screen.getByLabelText("Search tags");
    fireEvent.change(searchInput, { target: { value: "NewTag" } });
    expect(screen.getByText(/Create "NewTag"/)).toBeInTheDocument();
  });

  it("should call onCreate when create button clicked", () => {
    const onCreate = vi.fn();
    render(
      <TagSelector
        tags={mockTags}
        selectedIds={[]}
        onChange={vi.fn()}
        onCreate={onCreate}
      />,
    );
    const searchInput = screen.getByLabelText("Search tags");
    fireEvent.change(searchInput, { target: { value: "NewTag" } });
    fireEvent.click(screen.getByText(/Create "NewTag"/));
    expect(onCreate).toHaveBeenCalledWith("NewTag");
  });

  it("should have fieldset and legend", () => {
    render(<TagSelector tags={mockTags} selectedIds={[]} onChange={vi.fn()} />);
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });
});
