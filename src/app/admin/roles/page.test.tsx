import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import RolesPage from "./page";
import type { Role, User, UsersResponse } from "@/lib/api/admin";

vi.mock("@/lib/api/admin", () => ({
  getUsers: vi.fn(),
  getRoles: vi.fn(),
  updateUserRole: vi.fn(),
}));

import { getUsers, getRoles, updateUserRole } from "@/lib/api/admin";

const mockGetUsers = vi.mocked(getUsers);
const mockGetRoles = vi.mocked(getRoles);
const mockUpdateUserRole = vi.mocked(updateUserRole);

const ROLE_ADMIN: Role = {
  id: "role-1",
  name: "admin",
  permissions: ["users.read", "users.write"],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const ROLE_VIEWER: Role = {
  id: "role-2",
  name: "viewer",
  permissions: ["users.read"],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const USER: User = {
  id: "user-1",
  email: "admin@example.com",
  role: ROLE_ADMIN,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const USERS_RESPONSE: UsersResponse = {
  users: [USER],
  total: 1,
  page: 1,
  limit: 20,
};

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RolesPage", () => {
  it("shows loading state initially", () => {
    mockGetUsers.mockReturnValue(new Promise(() => {}));
    mockGetRoles.mockReturnValue(new Promise(() => {}));

    render(<RolesPage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders heading", async () => {
    mockGetUsers.mockResolvedValue(USERS_RESPONSE);
    mockGetRoles.mockResolvedValue([ROLE_ADMIN, ROLE_VIEWER]);

    render(<RolesPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Role Management" }),
    ).toBeInTheDocument();
  });

  it("renders users table after loading", async () => {
    mockGetUsers.mockResolvedValue(USERS_RESPONSE);
    mockGetRoles.mockResolvedValue([ROLE_ADMIN, ROLE_VIEWER]);

    render(<RolesPage />);

    await waitFor(() => {
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("shows error state on failure", async () => {
    mockGetUsers.mockRejectedValue(new Error("Network error"));
    mockGetRoles.mockResolvedValue([]);

    render(<RolesPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText("Network error")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Retry" }),
    ).toBeInTheDocument();
  });

  it("has accessible role selects for each user", async () => {
    mockGetUsers.mockResolvedValue(USERS_RESPONSE);
    mockGetRoles.mockResolvedValue([ROLE_ADMIN, ROLE_VIEWER]);

    render(<RolesPage />);

    await waitFor(() => {
      expect(
        screen.getByLabelText("Role for admin@example.com"),
      ).toBeInTheDocument();
    });
  });

  it("calls updateUserRole on role change", async () => {
    const updatedUser = { ...USER, role: ROLE_VIEWER };
    mockGetUsers.mockResolvedValue(USERS_RESPONSE);
    mockGetRoles.mockResolvedValue([ROLE_ADMIN, ROLE_VIEWER]);
    mockUpdateUserRole.mockResolvedValue(updatedUser);

    const user = userEvent.setup();
    render(<RolesPage />);

    await waitFor(() => {
      expect(
        screen.getByLabelText("Role for admin@example.com"),
      ).toBeInTheDocument();
    });

    const select = screen.getByLabelText("Role for admin@example.com");
    await user.selectOptions(select, "role-2");

    await waitFor(() => {
      expect(mockUpdateUserRole).toHaveBeenCalledWith("user-1", "role-2");
    });
  });

  it("has main landmark element", async () => {
    mockGetUsers.mockResolvedValue(USERS_RESPONSE);
    mockGetRoles.mockResolvedValue([ROLE_ADMIN, ROLE_VIEWER]);

    render(<RolesPage />);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders retry button that re-fetches data", async () => {
    mockGetUsers.mockRejectedValueOnce(new Error("Fail"));
    mockGetRoles.mockResolvedValue([]);

    const user = userEvent.setup();
    render(<RolesPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    mockGetUsers.mockResolvedValue(USERS_RESPONSE);
    mockGetRoles.mockResolvedValue([ROLE_ADMIN, ROLE_VIEWER]);

    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });
  });
});
