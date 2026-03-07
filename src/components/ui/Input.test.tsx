import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import Input from "./Input";

afterEach(() => {
  cleanup();
});

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input label="Email" name="email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("links error to input via aria-describedby", () => {
    render(<Input label="Email" name="email" error="Required" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
  });
});
