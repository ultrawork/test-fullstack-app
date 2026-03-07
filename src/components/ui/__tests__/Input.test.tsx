import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach } from "vitest";
import Input from "../Input";

afterEach(() => {
  cleanup();
});

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("associates label with input via htmlFor", () => {
    render(<Input label="Username" />);
    const input = screen.getByLabelText("Username");
    expect(input.tagName).toBe("INPUT");
  });

  it("displays error message", () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("sets aria-describedby when error is present", () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-describedby");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("does not set aria-describedby without error", () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("accepts user input", async () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText("Name");
    await userEvent.type(input, "John");
    expect(input).toHaveValue("John");
  });

  it("passes additional props", () => {
    render(<Input label="Email" type="email" placeholder="Enter email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("placeholder", "Enter email");
  });
});
