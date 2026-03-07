import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import HomePage from "./page";

vi.mock("next/link", () => {
  return {
    default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
      return <a href={href}>{children}</a>;
    },
  };
});

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

  it("renders sign in and sign up links", () => {
    render(<HomePage />);
    expect(screen.getByText("Sign In")).toHaveAttribute("href", "/login");
    expect(screen.getByText("Sign Up")).toHaveAttribute("href", "/register");
  });
});
