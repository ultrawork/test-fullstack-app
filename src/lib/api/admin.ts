const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Role entity returned by the admin API. */
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

/** User entity returned by the admin API. */
export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/** Paginated list of users. */
export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

/** Payload for creating a new role. */
export interface CreateRolePayload {
  name: string;
  permissions: string[];
}

/** Payload for updating an existing role. */
export interface UpdateRolePayload {
  name?: string;
  permissions?: string[];
}

/** Error thrown when the API returns a non-2xx status. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new ApiError(
      response.status,
      (body as { message?: string }).message ?? response.statusText,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/** Fetch paginated list of users. */
export async function getUsers(
  page = 1,
  limit = 20,
): Promise<UsersResponse> {
  return request<UsersResponse>(
    `/api/v2/admin/users?page=${page}&limit=${limit}`,
  );
}

/** Fetch a single user by id. */
export async function getUserById(id: string): Promise<User> {
  return request<User>(
    `/api/v2/admin/users/${encodeURIComponent(id)}`,
  );
}

/** Change a user's role. */
export async function updateUserRole(
  userId: string,
  roleId: string,
): Promise<User> {
  return request<User>(
    `/api/v2/admin/users/${encodeURIComponent(userId)}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ roleId }),
    },
  );
}

/** Delete a user by id. */
export async function deleteUser(id: string): Promise<void> {
  return request<void>(
    `/api/v2/admin/users/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

/** Fetch all available roles. */
export async function getRoles(): Promise<Role[]> {
  return request<Role[]>("/api/v2/admin/roles");
}

/** Create a new role. */
export async function createRole(payload: CreateRolePayload): Promise<Role> {
  return request<Role>("/api/v2/admin/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Update an existing role. */
export async function updateRole(
  id: string,
  payload: UpdateRolePayload,
): Promise<Role> {
  return request<Role>(
    `/api/v2/admin/roles/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/** Delete a role by id. */
export async function deleteRole(id: string): Promise<void> {
  return request<void>(
    `/api/v2/admin/roles/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
