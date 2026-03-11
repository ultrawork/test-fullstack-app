import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import CategoryBadge from "../CategoryBadge";

afterEach(() => {
  cleanup();
});

describe("CategoryBadge", () => {
  it("should render category name", () => {
    render(<CategoryBadge name="Work" color="#FF0000" />);
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("should apply background color", () => {
    render(<CategoryBadge name="Work" color="#FF0000" />);
    const badge = screen.getByText("Work").closest("span");
    expect(badge).toHaveStyle({ backgroundColor: "#FF0000" });
  });

  it("should render small size", () => {
    render(<CategoryBadge name="Work" color="#FF0000" size="sm" />);
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("should apply contrast text color for dark background", () => {
    render(<CategoryBadge name="Dark" color="#000000" />);
    const badge = screen.getByText("Dark").closest("span");
    expect(badge).toHaveStyle({ color: "#FFFFFF" });
  });

  it("should apply contrast text color for light background", () => {
    render(<CategoryBadge name="Light" color="#FFFFFF" />);
    const badge = screen.getByText("Light").closest("span");
    expect(badge).toHaveStyle({ color: "#000000" });
  });
});
