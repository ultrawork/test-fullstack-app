import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import { PinButton } from "./PinButton";

afterEach(() => {
  cleanup();
});

describe("PinButton", () => {
  it("renders with 'Pin note' label when unpinned", () => {
    render(<PinButton isPinned={false} onToggle={() => {}} />);
    const button = screen.getByRole("button", { name: "Pin note" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("renders with 'Unpin note' label when pinned", () => {
    render(<PinButton isPinned={true} onToggle={() => {}} />);
    const button = screen.getByRole("button", { name: "Unpin note" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggle when clicked", async () => {
    const onToggle = vi.fn();
    render(<PinButton isPinned={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button", { name: "Pin note" }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("stops event propagation on click", async () => {
    const onToggle = vi.fn();
    const onParentClick = vi.fn();

    render(
      <div onClick={onParentClick}>
        <PinButton isPinned={false} onToggle={onToggle} />
      </div>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Pin note" }));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
