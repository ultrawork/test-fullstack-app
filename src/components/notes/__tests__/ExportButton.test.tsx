import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import ExportButton from "../ExportButton";
import type { Note } from "@/types/note";

vi.mock("@/lib/export-note", () => ({
  downloadNoteAsTextFile: vi.fn(),
}));

import { downloadNoteAsTextFile } from "@/lib/export-note";

const mockNote: Note = {
  id: "1",
  title: "Test Note",
  content: "Test content",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-16T12:00:00Z",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ExportButton", () => {
  it("renders with accessible label", () => {
    render(<ExportButton note={mockNote} />);
    const button = screen.getByRole("button", {
      name: "Export note as text file",
    });
    expect(button).toBeInTheDocument();
  });

  it("displays 'Export' text", () => {
    render(<ExportButton note={mockNote} />);
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("calls downloadNoteAsTextFile on click", async () => {
    const user = userEvent.setup();
    render(<ExportButton note={mockNote} />);

    const button = screen.getByRole("button", {
      name: "Export note as text file",
    });
    await user.click(button);

    expect(downloadNoteAsTextFile).toHaveBeenCalledWith(mockNote);
    expect(downloadNoteAsTextFile).toHaveBeenCalledOnce();
  });
});
