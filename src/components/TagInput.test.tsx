import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import TagInput from "./TagInput";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mockFetch = (responses: Array<{ ok: boolean; json: () => Promise<unknown> }>) => {
  let callIndex = 0;
  return vi.spyOn(global, "fetch").mockImplementation(() => {
    const response = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return Promise.resolve(response as Response);
  });
};

describe("TagInput", () => {
  beforeEach(() => {
    mockFetch([{ ok: true, json: () => Promise.resolve(["react", "typescript", "css"]) }]);
  });

  it("renders label 'Добавить тег'", () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    expect(screen.getByLabelText("Добавить тег")).toBeInTheDocument();
  });

  it("renders input with data-testid=tag-input", () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    expect(screen.getByTestId("tag-input")).toBeInTheDocument();
  });

  it("renders add button with data-testid=tag-add-button", () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    expect(screen.getByTestId("tag-add-button")).toBeInTheDocument();
  });

  it("input has a placeholder", () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    const input = screen.getByTestId("tag-input");
    expect(input).toHaveAttribute("placeholder");
  });

  it("loads available tags on mount via GET /api/tags", async () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/tags");
    });
  });

  it("shows suggestions dropdown when input is focused and tags are loaded", async () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    const input = screen.getByTestId("tag-input");
    await userEvent.click(input);
    await waitFor(() => {
      expect(screen.getByTestId("tag-suggestions")).toBeInTheDocument();
    });
  });

  it("dropdown has role=listbox", async () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    await userEvent.click(screen.getByTestId("tag-input"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  it("suggestion options have role=option", async () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    await userEvent.click(screen.getByTestId("tag-input"));
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);
    });
  });

  it("excludes existing tags from suggestions", async () => {
    render(
      <TagInput noteId="note-1" existingTags={["react"]} onAdded={() => {}} />,
    );
    await userEvent.click(screen.getByTestId("tag-input"));
    await waitFor(() => {
      expect(screen.queryByText("react")).not.toBeInTheDocument();
      expect(screen.getByText("typescript")).toBeInTheDocument();
    });
  });

  it("filters suggestions by input value", async () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    await userEvent.type(screen.getByTestId("tag-input"), "ty");
    await waitFor(() => {
      expect(screen.getByText("typescript")).toBeInTheDocument();
      expect(screen.queryByText("react")).not.toBeInTheDocument();
    });
  });

  it("clicking a suggestion adds the tag via POST and calls onAdded", async () => {
    mockFetch([
      { ok: true, json: () => Promise.resolve(["react", "typescript"]) },
      { ok: true, json: () => Promise.resolve({ tag: "typescript" }) },
    ]);
    const onAdded = vi.fn();
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={onAdded} />);
    await userEvent.click(screen.getByTestId("tag-input"));
    await waitFor(() => screen.getByText("typescript"));
    await userEvent.click(screen.getByText("typescript"));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/notes/note-1/tags",
        expect.objectContaining({ method: "POST" }),
      );
      expect(onAdded).toHaveBeenCalledWith("typescript");
    });
  });

  it("clears input after successful add", async () => {
    mockFetch([
      { ok: true, json: () => Promise.resolve(["react"]) },
      { ok: true, json: () => Promise.resolve({ tag: "react" }) },
    ]);
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    const input = screen.getByTestId("tag-input");
    await userEvent.click(input);
    await waitFor(() => screen.getByText("react"));
    await userEvent.click(screen.getByText("react"));
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("add button is disabled when input is empty", () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    expect(screen.getByTestId("tag-add-button")).toBeDisabled();
  });

  it("add button is disabled when input matches an existing tag (case-insensitive)", async () => {
    render(
      <TagInput noteId="note-1" existingTags={["React"]} onAdded={() => {}} />,
    );
    await userEvent.type(screen.getByTestId("tag-input"), "react");
    expect(screen.getByTestId("tag-add-button")).toBeDisabled();
  });

  it("does not add empty string via Enter", async () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    await userEvent.click(screen.getByTestId("tag-input"));
    await userEvent.keyboard("{Enter}");
    // no POST should be made for empty input
    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/notes/"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("has aria-live region for errors", () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    expect(document.querySelector("[aria-live]")).toBeInTheDocument();
  });

  it("input has aria-expanded attribute", () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    const input = screen.getByTestId("tag-input");
    expect(input).toHaveAttribute("aria-expanded");
  });

  it("input label is linked via htmlFor", () => {
    render(<TagInput noteId="note-1" existingTags={[]} onAdded={() => {}} />);
    const input = screen.getByLabelText("Добавить тег");
    expect(input).toBeInTheDocument();
  });
});
