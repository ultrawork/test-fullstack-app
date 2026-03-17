import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach } from "vitest";
import HomePage from "./page";

afterEach(() => {
  cleanup();
});

describe("HomePage", () => {
  it("renders the heading", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Notes App" }),
    ).toBeInTheDocument();
  });

  it("renders main element", () => {
    render(<HomePage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders form with Title and Content fields", () => {
    render(<HomePage />);
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Content")).toBeInTheDocument();
  });

  it("renders Create Note and Clear buttons", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("button", { name: "Create Note" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("allows typing in Title and Content fields", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const titleInput = screen.getByLabelText("Title");
    const contentInput = screen.getByLabelText("Content");

    await user.type(titleInput, "My Note");
    await user.type(contentInput, "Some content");

    expect(titleInput).toHaveValue("My Note");
    expect(contentInput).toHaveValue("Some content");
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole("button", { name: "Create Note" }));

    const titleInput = screen.getByLabelText("Title");
    const contentInput = screen.getByLabelText("Content");

    expect(titleInput).toHaveAttribute("aria-invalid", "true");
    expect(contentInput).toHaveAttribute("aria-invalid", "true");

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Content is required")).toBeInTheDocument();
  });

  it("clears field error when user starts typing", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole("button", { name: "Create Note" }));
    expect(screen.getByText("Title is required")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Title"), "a");
    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
  });

  it("shows success status after valid submit and does not clear fields", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.type(screen.getByLabelText("Title"), "My Note");
    await user.type(screen.getByLabelText("Content"), "Some content");
    await user.click(screen.getByRole("button", { name: "Create Note" }));

    expect(screen.getByText("Note has been created")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("My Note");
    expect(screen.getByLabelText("Content")).toHaveValue("Some content");
  });

  it("Clear button resets fields, errors, and status", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.type(screen.getByLabelText("Title"), "My Note");
    await user.type(screen.getByLabelText("Content"), "Some content");
    await user.click(screen.getByRole("button", { name: "Create Note" }));

    expect(screen.getByText("Note has been created")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Content")).toHaveValue("");
    expect(screen.queryByText("Note has been created")).not.toBeInTheDocument();
  });

  it("Clear button removes validation errors", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole("button", { name: "Create Note" }));
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Content is required")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    expect(screen.queryByText("Content is required")).not.toBeInTheDocument();
  });
});
