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

  it("renders the Clear button", () => {
    render(<NoteEditor onSubmit={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Clear" }),
    ).toBeInTheDocument();
  });

  it("clears all form fields when Clear is clicked", async () => {
    const user = userEvent.setup();
    render(<NoteEditor onSubmit={vi.fn()} />);

    const titleInput = screen.getByLabelText("Title");
    const contentInput = screen.getByLabelText("Content");

    await user.type(titleInput, "Test Title");
    await user.type(contentInput, "Test Content");

    expect(titleInput).toHaveValue("Test Title");
    expect(contentInput).toHaveValue("Test Content");

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(titleInput).toHaveValue("");
    expect(contentInput).toHaveValue("");
  });

  it("clears validation errors when Clear is clicked", async () => {
    const user = userEvent.setup();
    render(<NoteEditor onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Content is required")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Content is required"),
    ).not.toBeInTheDocument();
  });

  it("does not call onSubmit when Clear is clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<NoteEditor onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Title"), "Test");
    await user.type(screen.getByLabelText("Content"), "Content");
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
