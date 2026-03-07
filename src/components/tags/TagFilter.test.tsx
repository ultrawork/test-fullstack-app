import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import TagFilter from "./TagFilter";
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

describe("TagFilter", () => {
  it("renders nothing when no tags", () => {
    const { container } = render(
      <TagFilter tags={[]} selectedTagIds={[]} onToggle={() => {}} />
    );
    expect(container.textContent).toBe("");
  });

  it("renders filter tags", () => {
    render(
      <TagFilter tags={mockTags} selectedTagIds={[]} onToggle={() => {}} />
    );
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("calls onToggle when tag clicked", async () => {
    const onToggle = vi.fn();
    render(
      <TagFilter tags={mockTags} selectedTagIds={[]} onToggle={onToggle} />
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Filter by Work" })
    );
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("shows clear button when tags are selected", () => {
    render(
      <TagFilter tags={mockTags} selectedTagIds={["1"]} onToggle={() => {}} />
    );
    expect(
      screen.getByRole("button", { name: "Clear all tag filters" })
    ).toBeInTheDocument();
  });

  it("marks selected tags with aria-pressed", () => {
    render(
      <TagFilter tags={mockTags} selectedTagIds={["1"]} onToggle={() => {}} />
    );
    expect(
      screen.getByRole("button", { name: "Remove filter Work" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Filter by Personal" })
    ).toHaveAttribute("aria-pressed", "false");
  });
});
