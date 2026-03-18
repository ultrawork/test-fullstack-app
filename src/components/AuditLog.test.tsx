import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AuditLog from "./AuditLog";
import type { AuditLogResponse } from "@/lib/api/audit";

vi.mock("@/lib/api/audit", () => ({
  getAuditLog: vi.fn(),
}));

import { getAuditLog } from "@/lib/api/audit";

const mockGetAuditLog = vi.mocked(getAuditLog);

const AUDIT_RESPONSE: AuditLogResponse = {
  entries: [
    {
      id: "a1",
      action: "user.login",
      userId: "u1",
      userEmail: "alice@example.com",
      targetType: "session",
      targetId: "s1",
      details: {},
      ipAddress: "10.0.0.1",
      createdAt: "2026-03-15T08:00:00Z",
    },
    {
      id: "a2",
      action: "note.create",
      userId: "u1",
      userEmail: "alice@example.com",
      targetType: "note",
      targetId: "n1",
      details: {},
      ipAddress: "10.0.0.1",
      createdAt: "2026-03-15T09:00:00Z",
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
};

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AuditLog", () => {
  it("shows loading state initially", () => {
    mockGetAuditLog.mockReturnValue(new Promise(() => {}));

    render(<AuditLog />);

    expect(screen.getByText("Loading audit log...")).toBeInTheDocument();
  });

  it("renders heading", () => {
    mockGetAuditLog.mockReturnValue(new Promise(() => {}));

    render(<AuditLog />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Audit Log" }),
    ).toBeInTheDocument();
  });

  it("renders audit entries after loading", async () => {
    mockGetAuditLog.mockResolvedValue(AUDIT_RESPONSE);

    render(<AuditLog />);

    await waitFor(() => {
      expect(screen.getAllByText("alice@example.com")).toHaveLength(2);
    });
    expect(screen.getByText("user.login")).toBeInTheDocument();
    expect(screen.getByText("note.create")).toBeInTheDocument();
  });

  it("shows error state on failure", async () => {
    mockGetAuditLog.mockRejectedValue(new Error("Server error"));

    render(<AuditLog />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText("Server error")).toBeInTheDocument();
  });

  it("renders empty state when no entries", async () => {
    mockGetAuditLog.mockResolvedValue({
      entries: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    render(<AuditLog />);

    await waitFor(() => {
      expect(screen.getByText("No audit entries found.")).toBeInTheDocument();
    });
  });

  it("has filter dropdown with action options", async () => {
    mockGetAuditLog.mockResolvedValue(AUDIT_RESPONSE);

    render(<AuditLog />);

    const filter = screen.getByLabelText("Filter by action:");
    expect(filter).toBeInTheDocument();
    expect(filter).toHaveValue("");
  });

  it("filters by action when dropdown changes", async () => {
    mockGetAuditLog.mockResolvedValue(AUDIT_RESPONSE);

    const user = userEvent.setup();
    render(<AuditLog />);

    await waitFor(() => {
      expect(screen.getAllByText("alice@example.com")).toHaveLength(2);
    });

    mockGetAuditLog.mockResolvedValue({
      entries: [AUDIT_RESPONSE.entries[0]],
      total: 1,
      page: 1,
      limit: 20,
    });

    await user.selectOptions(
      screen.getByLabelText("Filter by action:"),
      "user.login",
    );

    await waitFor(() => {
      expect(mockGetAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: "user.login", page: 1 }),
      );
    });
  });

  it("has section landmark", () => {
    mockGetAuditLog.mockReturnValue(new Promise(() => {}));

    render(<AuditLog />);

    expect(
      screen.getByRole("region", { name: "Audit log" }),
    ).toBeInTheDocument();
  });

  it("renders retry button on error", async () => {
    mockGetAuditLog.mockRejectedValueOnce(new Error("Fail"));

    const user = userEvent.setup();
    render(<AuditLog />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    mockGetAuditLog.mockResolvedValue(AUDIT_RESPONSE);

    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getAllByText("alice@example.com").length).toBeGreaterThan(0);
    });
  });
});
