import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import ImageGallery from "../ImageGallery";
import type { NoteImage } from "@/types/note-image";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal ||
    function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close ||
    function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    };
});

afterEach(() => {
  cleanup();
});

const mockImages: NoteImage[] = [
  {
    id: "img1",
    filename: "photo1.jpg",
    path: "/uploads/images/1/photo1.jpg",
    mimeType: "image/jpeg",
    size: 1024,
    order: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "img2",
    filename: "photo2.png",
    path: "/uploads/images/1/photo2.png",
    mimeType: "image/png",
    size: 2048,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("ImageGallery", () => {
  it("should render nothing for empty images", () => {
    const { container } = render(<ImageGallery images={[]} />);
    expect(container.querySelector("section")).toBeNull();
  });

  it("should render gallery with images", () => {
    render(<ImageGallery images={mockImages} />);
    const section = screen.getByLabelText("Image gallery");
    expect(section).toBeInTheDocument();
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
  });

  it("should open lightbox on image click", () => {
    render(<ImageGallery images={mockImages} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
  });
});
