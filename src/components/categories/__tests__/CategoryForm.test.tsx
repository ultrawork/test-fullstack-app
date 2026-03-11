import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import CategoryForm from "../CategoryForm";

afterEach(() => {
  cleanup();
});

describe("CategoryForm", () => {
  it("should render form fields", () => {
    render(<CategoryForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/Category name/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Color")).toBeInTheDocument();
  });

  it("should show 'Create Category' button in create mode", () => {
    render(<CategoryForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Create Category")).toBeInTheDocument();
  });

  it("should show 'Update Category' button in edit mode", () => {
    render(
      <CategoryForm onSubmit={vi.fn()} onCancel={vi.fn()} isEditing />,
    );
    expect(screen.getByText("Update Category")).toBeInTheDocument();
  });

  it("should call onCancel when cancel clicked", () => {
    const onCancel = vi.fn();
    render(<CategoryForm onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("should validate empty name", async () => {
    const onSubmit = vi.fn();
    render(<CategoryForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText("Create Category"));
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("should submit with valid data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CategoryForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Category name/i), {
      target: { value: "Work" },
    });
    fireEvent.click(screen.getByText("Create Category"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Work",
        color: "#3B82F6",
      });
    });
  });

  it("should populate initial values in edit mode", () => {
    render(
      <CategoryForm
        initialName="Work"
        initialColor="#FF0000"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isEditing
      />,
    );
    expect(screen.getByLabelText(/Category name/i)).toHaveValue("Work");
  });
});
