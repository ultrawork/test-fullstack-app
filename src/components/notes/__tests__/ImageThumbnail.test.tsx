import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import ImageThumbnail from "../ImageThumbnail";
import type { NoteImage } from "@/types/note-image";

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
  {
    id: "img3",
    filename: "photo3.jpg",
    path: "/uploads/images/1/photo3.jpg",
    mimeType: "image/jpeg",
    size: 3072,
    order: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "img4",
    filename: "photo4.jpg",
    path: "/uploads/images/1/photo4.jpg",
    mimeType: "image/jpeg",
    size: 4096,
    order: 3,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("ImageThumbnail", () => {
  it("should render nothing for empty images", () => {
    const { container } = render(<ImageThumbnail images={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render image thumbnails", () => {
    render(<ImageThumbnail images={mockImages.slice(0, 2)} />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("alt", "Attachment photo1.jpg");
  });

  it("should show remaining count when more than maxVisible", () => {
    render(<ImageThumbnail images={mockImages} maxVisible={2} />);
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("should default to maxVisible of 3", () => {
    render(<ImageThumbnail images={mockImages} />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });
});
