import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import DeleteConfirmModal from "../DeleteConfirmModal";

afterEach(() => {
  cleanup();
});

describe("DeleteConfirmModal", () => {
  it("renders note title in confirmation", () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        noteTitle="Important Note"
      />,
    );
    expect(
      screen.getByText(/Are you sure you want to delete "Important Note"/),
    ).toBeInTheDocument();
  });

  it("renders cancel and delete buttons", () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        noteTitle="Test"
      />,
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", async () => {
    const onClose = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        noteTitle="Test"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onConfirm and onClose when delete is clicked", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        noteTitle="Test"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("does not render when closed", () => {
    render(
      <DeleteConfirmModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        noteTitle="Test"
      />,
    );
    expect(screen.queryByText(/Are you sure/)).not.toBeInTheDocument();
  });
});
