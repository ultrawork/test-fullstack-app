import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import ColorPicker from "./ColorPicker";

afterEach(() => {
  cleanup();
});

describe("ColorPicker", () => {
  it("renders preset colors", () => {
    render(<ColorPicker value="#EF4444" onChange={() => {}} />);
    const buttons = screen.getAllByRole("radio");
    expect(buttons.length).toBe(10);
  });

  it("marks selected color", () => {
    render(<ColorPicker value="#EF4444" onChange={() => {}} />);
    const selected = screen.getByRole("radio", {
      name: "Select color #EF4444",
    });
    expect(selected).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange when color clicked", async () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#EF4444" onChange={onChange} />);
    await userEvent.click(
      screen.getByRole("radio", { name: "Select color #3B82F6" })
    );
    expect(onChange).toHaveBeenCalledWith("#3B82F6");
  });

  it("renders custom label", () => {
    render(
      <ColorPicker value="#EF4444" onChange={() => {}} label="Tag Color" />
    );
    expect(screen.getByText("Tag Color")).toBeInTheDocument();
  });
});
