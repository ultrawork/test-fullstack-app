import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import ArchiveButton from "../ArchiveButton";
import { useArchiveStore } from "@/stores/archive-store";
import { act } from "@testing-library/react";

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  act(() => {
    useArchiveStore.setState({ archivedNotes: [] });
  });
  mockFetch.mockReset();
});

describe("ArchiveButton", () => {
  it("renders with aria-pressed=false when not archived", () => {
    render(<ArchiveButton id="1" title="Test" content="Content" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("aria-label", 'Архивировать "Test"');
  });

  it("renders with aria-pressed=true when archived", () => {
    act(() => {
      useArchiveStore.setState({
        archivedNotes: [
          {
            id: "1",
            title: "Test",
            content: "Content",
            archivedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      });
    });

    render(<ArchiveButton id="1" title="Test" content="Content" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute(
      "aria-label",
      'Восстановить "Test" из архива',
    );
  });

  it("calls archiveNote on click when not archived", async () => {
    const user = userEvent.setup();
    const mockItem = {
      id: "1",
      title: "Test",
      content: "Content",
      archivedAt: "2024-01-01T00:00:00.000Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockItem }),
    });

    render(<ArchiveButton id="1" title="Test" content="Content" />);
    const button = screen.getByRole("button");

    await user.click(button);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/notes/1/archive",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
