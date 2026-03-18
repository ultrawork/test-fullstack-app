const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Single audit log entry. */
export interface AuditEntry {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

/** Paginated audit log response. */
export interface AuditLogResponse {
  entries: AuditEntry[];
  total: number;
  page: number;
  limit: number;
}

/** Filters for querying the audit log. */
export interface AuditLogParams {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
  from?: string;
  to?: string;
}

/** Error thrown when the audit API returns a non-2xx status. */
export class AuditApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AuditApiError";
  }
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new AuditApiError(
      response.status,
      (body as { message?: string }).message ?? response.statusText,
    );
  }

  return response.json() as Promise<T>;
}

/** Fetch paginated audit log with optional filters. */
export async function getAuditLog(
  params: AuditLogParams = {},
): Promise<AuditLogResponse> {
  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.action) searchParams.set("action", params.action);
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);

  const query = searchParams.toString();
  return request<AuditLogResponse>(
    `/api/v2/audit/logs${query ? `?${query}` : ""}`,
  );
}

/** Fetch a single audit entry by id. */
export async function getAuditEntry(id: string): Promise<AuditEntry> {
  return request<AuditEntry>(
    `/api/v2/audit/logs/${encodeURIComponent(id)}`,
  );
}
