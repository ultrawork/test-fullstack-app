import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import ImageUploader from "../ImageUploader";
import type { NoteImage } from "@/types/note-image";

afterEach(() => {
  cleanup();
});

const mockExistingImages: NoteImage[] = [
  {
    id: "img1",
    filename: "photo1.jpg",
    path: "/uploads/images/1/photo1.jpg",
    mimeType: "image/jpeg",
    size: 1024,
    order: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("ImageUploader", () => {
  it("should render image count label", () => {
    render(
      <ImageUploader
        existingImages={[]}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Images (0/5)")).toBeInTheDocument();
  });

  it("should render existing images", () => {
    render(
      <ImageUploader
        existingImages={mockExistingImages}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Images (1/5)")).toBeInTheDocument();
    const img = screen.getByAltText("Attachment photo1.jpg");
    expect(img).toBeInTheDocument();
  });

  it("should render drop zone", () => {
    render(
      <ImageUploader
        existingImages={[]}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(
      screen.getByLabelText("Drop images here or click to select"),
    ).toBeInTheDocument();
  });

  it("should hide drop zone when max images reached", () => {
    const fiveImages = Array.from({ length: 5 }, (_, i) => ({
      id: `img${i}`,
      filename: `photo${i}.jpg`,
      path: `/uploads/images/1/photo${i}.jpg`,
      mimeType: "image/jpeg",
      size: 1024,
      order: i,
      createdAt: "2024-01-01T00:00:00.000Z",
    }));
    render(
      <ImageUploader
        existingImages={fiveImages}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(
      screen.queryByLabelText("Drop images here or click to select"),
    ).not.toBeInTheDocument();
  });

  it("should call onDelete when remove button is clicked", () => {
    const onDelete = vi.fn();
    render(
      <ImageUploader
        existingImages={mockExistingImages}
        onUpload={vi.fn()}
        onDelete={onDelete}
      />,
    );
    const removeBtn = screen.getByLabelText("Remove image photo1.jpg");
    fireEvent.click(removeBtn);
    expect(onDelete).toHaveBeenCalledWith("img1");
  });

  it("should show error for invalid file type", () => {
    render(
      <ImageUploader
        existingImages={[]}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const dropZone = screen.getByLabelText(
      "Drop images here or click to select",
    );
    const file = new File(["test"], "test.gif", { type: "image/gif" });
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid file type",
    );
  });
});
