import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import DeleteConfirmModal from "../DeleteConfirmModal";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

afterEach(() => {
  cleanup();
});

describe("DeleteConfirmModal", () => {
  it("should render title in message", () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="My Note"
      />,
    );
    expect(screen.getByText(/My Note/)).toBeInTheDocument();
  });

  it("should have Cancel and Delete buttons", () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="My Note"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Cancel", hidden: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete", hidden: true }),
    ).toBeInTheDocument();
  });

  it("should call onConfirm when Delete clicked", () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="My Note"
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Delete", hidden: true }),
    );
    expect(onConfirm).toHaveBeenCalled();
  });

  it("should call onClose when Cancel clicked", () => {
    const onClose = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        title="My Note"
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Cancel", hidden: true }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("should not render when not open", () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="My Note"
      />,
    );
    expect(container.querySelector("dialog")).not.toBeInTheDocument();
  });
});
