import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import TagForm from "../TagForm";

afterEach(() => {
  cleanup();
});

describe("TagForm", () => {
  it("should render name input and color picker", () => {
    render(<TagForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText("Tag name")).toBeInTheDocument();
    expect(screen.getByLabelText("Color")).toBeInTheDocument();
  });

  it("should show Create button for new tag", () => {
    render(<TagForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /Create Tag/ }),
    ).toBeInTheDocument();
  });

  it("should show Update button for editing", () => {
    render(<TagForm onSubmit={vi.fn()} onCancel={vi.fn()} isEditing />);
    expect(
      screen.getByRole("button", { name: /Update Tag/ }),
    ).toBeInTheDocument();
  });

  it("should call onCancel when Cancel clicked", () => {
    const onCancel = vi.fn();
    render(<TagForm onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("should populate initial values", () => {
    render(
      <TagForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialName="Work"
        initialColor="#FF0000"
        isEditing
      />,
    );
    expect(screen.getByLabelText("Tag name")).toHaveValue("Work");
  });

  it("should render color preset buttons", () => {
    render(<TagForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const colorButtons = screen
      .getAllByRole("button")
      .filter((btn) =>
        btn.getAttribute("aria-label")?.startsWith("Select color"),
      );
    expect(colorButtons.length).toBeGreaterThan(0);
  });
});
