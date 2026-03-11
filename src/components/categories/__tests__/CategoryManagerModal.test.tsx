import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import CategoryManagerModal from "../CategoryManagerModal";

vi.mock("@/stores/categories-store", () => ({
  useCategoriesStore: vi.fn(() => ({
    categories: [],
    fetchCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
  })),
}));

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

afterEach(() => {
  cleanup();
});

describe("CategoryManagerModal", () => {
  it("should render modal when open", () => {
    render(<CategoryManagerModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Manage Categories")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(<CategoryManagerModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText("Manage Categories")).not.toBeInTheDocument();
  });

  it("should show create button", () => {
    render(<CategoryManagerModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Create New Category")).toBeInTheDocument();
  });
});
