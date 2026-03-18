"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAuditLog,
  type AuditEntry,
  type AuditLogResponse,
} from "@/lib/api/audit";

/** Renders a single row in the audit log table. */
function AuditRow({ entry }: { readonly entry: AuditEntry }): React.JSX.Element {
  return (
    <tr>
      <td className="border p-2">
        <time dateTime={entry.createdAt}>
          {new Date(entry.createdAt).toLocaleString()}
        </time>
      </td>
      <td className="border p-2">{entry.action}</td>
      <td className="border p-2">{entry.userEmail}</td>
      <td className="border p-2">
        {entry.targetType}:{entry.targetId}
      </td>
      <td className="border p-2">{entry.ipAddress}</td>
    </tr>
  );
}

/** Displays a filterable, paginated audit log. */
export default function AuditLog(): React.JSX.Element {
  const [data, setData] = useState<AuditLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAuditLog({
        page,
        limit: 20,
        action: actionFilter || undefined,
      });
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load audit log",
      );
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleFilterChange = (action: string): void => {
    setActionFilter(action);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <section aria-label="Audit log">
      <h2 className="text-xl font-bold mb-4">Audit Log</h2>

      <div className="mb-4">
        <label htmlFor="action-filter" className="mr-2 font-medium">
          Filter by action:
        </label>
        <select
          id="action-filter"
          value={actionFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All actions</option>
          <option value="user.login">Login</option>
          <option value="user.logout">Logout</option>
          <option value="user.role_change">Role Change</option>
          <option value="note.create">Note Created</option>
          <option value="note.update">Note Updated</option>
          <option value="note.delete">Note Deleted</option>
        </select>
      </div>

      {loading && <p role="status">Loading audit log...</p>}

      {error && (
        <div role="alert" className="text-red-600 mb-4">
          <p>{error}</p>
          <button
            onClick={() => void fetchData()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className="border p-2 text-left">
                  Timestamp
                </th>
                <th scope="col" className="border p-2 text-left">
                  Action
                </th>
                <th scope="col" className="border p-2 text-left">
                  User
                </th>
                <th scope="col" className="border p-2 text-left">
                  Target
                </th>
                <th scope="col" className="border p-2 text-left">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody>
              {data.entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border p-4 text-center text-gray-500"
                  >
                    No audit entries found.
                  </td>
                </tr>
              ) : (
                data.entries.map((entry: AuditEntry) => (
                  <AuditRow key={entry.id} entry={entry} />
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <nav aria-label="Audit log pagination" className="mt-4 flex gap-2">
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
        </>
      )}
    </section>
  );
}
