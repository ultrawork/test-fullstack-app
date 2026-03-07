import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import TagBadge, { getContrastColor } from "../TagBadge";

afterEach(() => {
  cleanup();
});

describe("TagBadge", () => {
  it("should render tag name", () => {
    render(<TagBadge name="Work" color="#FF0000" />);
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("should apply background color", () => {
    render(<TagBadge name="Work" color="#FF0000" />);
    const badge = screen.getByText("Work").closest("span");
    expect(badge).toHaveStyle({ backgroundColor: "#FF0000" });
  });

  it("should show remove button when onRemove provided", () => {
    const onRemove = vi.fn();
    render(<TagBadge name="Work" color="#FF0000" onRemove={onRemove} />);
    const removeBtn = screen.getByRole("button", { name: "Remove tag Work" });
    expect(removeBtn).toBeInTheDocument();
  });

  it("should call onRemove when clicked", () => {
    const onRemove = vi.fn();
    render(<TagBadge name="Work" color="#FF0000" onRemove={onRemove} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove tag Work" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("should not show remove button when onRemove not provided", () => {
    render(<TagBadge name="Work" color="#FF0000" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should render small size", () => {
    render(<TagBadge name="Work" color="#FF0000" size="sm" />);
    expect(screen.getByText("Work")).toBeInTheDocument();
  });
});

describe("getContrastColor", () => {
  it("should return white for dark colors", () => {
    expect(getContrastColor("#000000")).toBe("#FFFFFF");
    expect(getContrastColor("#333333")).toBe("#FFFFFF");
  });

  it("should return black for light colors", () => {
    expect(getContrastColor("#FFFFFF")).toBe("#000000");
    expect(getContrastColor("#FFFF00")).toBe("#000000");
  });
});
