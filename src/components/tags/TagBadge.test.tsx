import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import TagBadge from "./TagBadge";

afterEach(() => {
  cleanup();
});

describe("TagBadge", () => {
  it("renders tag name", () => {
    render(<TagBadge name="Work" color="#3B82F6" />);
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("applies background color", () => {
    render(<TagBadge name="Test" color="#EF4444" />);
    const badge = screen.getByText("Test").closest("span");
    expect(badge).toHaveStyle({ backgroundColor: "#EF4444" });
  });

  it("shows remove button when onRemove provided", () => {
    const onRemove = vi.fn();
    render(<TagBadge name="Tag" color="#3B82F6" onRemove={onRemove} />);
    expect(
      screen.getByRole("button", { name: "Remove tag Tag" })
    ).toBeInTheDocument();
  });

  it("does not show remove button when onRemove not provided", () => {
    render(<TagBadge name="Tag" color="#3B82F6" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onRemove when remove button clicked", async () => {
    const onRemove = vi.fn();
    render(<TagBadge name="Tag" color="#3B82F6" onRemove={onRemove} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Remove tag Tag" })
    );
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("uses light text on dark background", () => {
    render(<TagBadge name="Dark" color="#000000" />);
    const badge = screen.getByText("Dark").closest("span");
    expect(badge).toHaveStyle({ color: "#FFFFFF" });
  });

  it("uses dark text on light background", () => {
    render(<TagBadge name="Light" color="#FFFFFF" />);
    const badge = screen.getByText("Light").closest("span");
    expect(badge).toHaveStyle({ color: "#1F2937" });
  });
});
