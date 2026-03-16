import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import NoteEditor from "../NoteEditor";

vi.mock("@/stores/categories-store", () => ({
  useCategoriesStore: vi.fn(() => ({
    categories: [
      { id: "cat-1", name: "Work", color: "#3B82F6" },
      { id: "cat-2", name: "Personal", color: "#10B981" },
    ],
    fetchCategories: vi.fn(),
  })),
}));

afterEach(() => {
  cleanup();
});

describe("NoteEditor", () => {
  it("renders title and content fields", () => {
    render(<NoteEditor onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Content")).toBeInTheDocument();
  });

  it("renders category select", () => {
    render(<NoteEditor onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Category (optional)")).toBeInTheDocument();
  });

  it("renders with initial values", () => {
    render(
      <NoteEditor
        initialTitle="My Note"
        initialContent="Some content"
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Title")).toHaveValue("My Note");
    expect(screen.getByLabelText("Content")).toHaveValue("Some content");
  });

  it("shows validation errors for empty fields", async () => {
    const onSubmit = vi.fn();
    render(<NoteEditor onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Content is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with correct values", async () => {
    const onSubmit = vi.fn();
    render(<NoteEditor onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Title"), "Test Title");
    await userEvent.type(screen.getByLabelText("Content"), "Test Content");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledWith(
      "Test Title",
      "Test Content",
      undefined,
    );
  });

  it("renders custom submit label", () => {
    render(<NoteEditor onSubmit={vi.fn()} submitLabel="Create Note" />);
    expect(
      screen.getByRole("button", { name: "Create Note" }),
    ).toBeInTheDocument();
  });

  it("renders Clear button", () => {
    render(<NoteEditor onSubmit={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Clear" }),
    ).toBeInTheDocument();
  });

  it("clears all fields when Clear button is clicked", async () => {
    render(<NoteEditor onSubmit={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Title"), "Test Title");
    await userEvent.type(screen.getByLabelText("Content"), "Test Content");
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Content")).toHaveValue("");
  });

  it("clears validation errors when Clear button is clicked", async () => {
    render(<NoteEditor onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Content is required")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    expect(screen.queryByText("Content is required")).not.toBeInTheDocument();
  });

  it("does not call onSubmit when Clear button is clicked", async () => {
    const onSubmit = vi.fn();
    render(<NoteEditor onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Title"), "Test Title");
    await userEvent.type(screen.getByLabelText("Content"), "Test Content");
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
