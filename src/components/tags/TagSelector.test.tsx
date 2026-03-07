import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import TagSelector from "./TagSelector";
import type { TagDTO } from "@/types";

afterEach(() => {
  cleanup();
});

const mockTags: TagDTO[] = [
  {
    id: "1",
    name: "Work",
    color: "#3B82F6",
    userId: "u1",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Personal",
    color: "#EF4444",
    userId: "u1",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

describe("TagSelector", () => {
  it("renders available tags", () => {
    render(
      <TagSelector availableTags={mockTags} selectedTagIds={[]} onChange={() => {}} />
    );
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("shows empty message when no tags available", () => {
    render(
      <TagSelector availableTags={[]} selectedTagIds={[]} onChange={() => {}} />
    );
    expect(screen.getByText("No tags available")).toBeInTheDocument();
  });

  it("calls onChange with tag added when unselected tag clicked", async () => {
    const onChange = vi.fn();
    render(
      <TagSelector
        availableTags={mockTags}
        selectedTagIds={[]}
        onChange={onChange}
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Select tag Work" })
    );
    expect(onChange).toHaveBeenCalledWith(["1"]);
  });

  it("calls onChange with tag removed when selected tag clicked", async () => {
    const onChange = vi.fn();
    render(
      <TagSelector
        availableTags={mockTags}
        selectedTagIds={["1", "2"]}
        onChange={onChange}
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Deselect tag Work" })
    );
    expect(onChange).toHaveBeenCalledWith(["2"]);
  });
});
