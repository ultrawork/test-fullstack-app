"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getUsers,
  getRoles,
  updateUserRole,
  type User,
  type Role,
  type UsersResponse,
} from "@/lib/api/admin";

/** Admin page for managing user roles. */
export default function RolesPage(): React.JSX.Element {
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        getUsers(page),
        getRoles(),
      ]);
      setUsersData(usersResponse);
      setRoles(rolesResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRoleChange = async (
    userId: string,
    roleId: string,
  ): Promise<void> => {
    setUpdatingUserId(userId);
    try {
      const updatedUser = await updateUserRole(userId, roleId);
      setUsersData((prev) =>
        prev
          ? {
              ...prev,
              users: prev.users.map((u: User) =>
                u.id === userId ? updatedUser : u,
              ),
            }
          : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const totalPages = usersData
    ? Math.ceil(usersData.total / usersData.limit)
    : 0;

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Role Management</h1>
        <p role="status">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Role Management</h1>
        <p role="alert" className="text-red-600">
          {error}
        </p>
        <button
          onClick={() => void fetchData()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Role Management</h1>

      <section aria-label="Users and roles">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th scope="col" className="border p-2 text-left">
                Email
              </th>
              <th scope="col" className="border p-2 text-left">
                Current Role
              </th>
              <th scope="col" className="border p-2 text-left">
                Change Role
              </th>
            </tr>
          </thead>
          <tbody>
            {usersData?.users.map((user: User) => (
              <tr key={user.id}>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.role.name}</td>
                <td className="border p-2">
                  <select
                    id={`role-select-${user.id}`}
                    value={user.role.id}
                    disabled={updatingUserId === user.id}
                    aria-label={`Role for ${user.email}`}
                    onChange={(e) =>
                      void handleRoleChange(user.id, e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  >
                    {roles.map((role: Role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {updatingUserId === user.id && (
                    <span
                      role="status"
                      className="ml-2 text-sm text-gray-500"
                    >
                      Updating...
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="px-3 py-1" aria-current="page">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}
