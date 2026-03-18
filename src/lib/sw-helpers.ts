export type PushPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;

export type PushPayloadAction = {
  action: string;
  title: string;
  icon?: string;
};

export type PushPayload = {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  priority?: PushPriority;
  type?: string;
  actions?: unknown;
  actionUrls?: Record<string, string>;
  requireInteraction?: boolean;
  renotify?: boolean;
  silent?: boolean;
  data?: Record<string, unknown> & {
    url?: string;
    actionUrls?: Record<string, string>;
    actions?: unknown;
  };
};

export type NotificationData = Record<string, unknown> & {
  url: string;
  actionUrls?: Record<string, string>;
  actions?: PushPayloadAction[];
  _meta: {
    priority: string | null;
    type: string | null;
  };
};

export type NotificationOptionsLike = {
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data: NotificationData;
  requireInteraction: boolean;
  renotify: boolean;
  silent: boolean;
  actions?: PushPayloadAction[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizePayloadActions(actions: unknown): PushPayloadAction[] | undefined {
  if (!Array.isArray(actions)) {
    return undefined;
  }

  return actions.filter((action): action is PushPayloadAction => {
    return isPlainObject(action) && typeof action.action === "string" && typeof action.title === "string";
  });
}

function normalizeActionUrls(actionUrls: unknown): Record<string, string> | undefined {
  if (!isPlainObject(actionUrls)) {
    return undefined;
  }

  const normalizedEntries = Object.entries(actionUrls).filter((entry): entry is [string, string] => {
    const [key, value] = entry;
    return typeof key === "string" && typeof value === "string";
  });

  return normalizedEntries.length > 0 ? Object.fromEntries(normalizedEntries) : undefined;
}

export function parsePushPayload(jsonText: string | null): PushPayload | null {
  if (!jsonText) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonText) as unknown;
    return isPlainObject(parsed) ? (parsed as PushPayload) : null;
  } catch {
    return null;
  }
}

export function buildNotificationOptions(
  payload: PushPayload | null,
): NotificationOptionsLike {
  const isHighOrUrgent = payload?.priority === "HIGH" || payload?.priority === "URGENT";
  const requireInteraction = payload?.requireInteraction ?? isHighOrUrgent ?? false;
  const tag = payload?.tag || undefined;
  const renotify = tag ? (payload?.renotify ?? isHighOrUrgent ?? false) : false;
  const silent = payload?.silent ?? (payload?.priority === "LOW") ?? false;
  const payloadData = isPlainObject(payload?.data) ? payload.data : undefined;
  const normalizedActions = normalizePayloadActions(payload?.actions);
  const actionUrls = normalizeActionUrls(payload?.actionUrls) ?? normalizeActionUrls(payloadData?.actionUrls);

  return {
    body: payload?.body || "",
    icon: payload?.icon,
    badge: payload?.badge,
    tag,
    data: {
      ...(payloadData || {}),
      url: payload?.url || payloadData?.url || "/",
      ...(actionUrls && { actionUrls }),
      ...(normalizedActions && { actions: normalizedActions }),
      _meta: {
        priority: payload?.priority || null,
        type: payload?.type || null,
      },
    },
    requireInteraction,
    renotify,
    silent,
    actions: normalizedActions,
  };
}

export function isSameOrigin(url: string, origin: string): boolean {
  try {
    return new URL(url, origin).origin === origin;
  } catch {
    return false;
  }
}

export function normalizeUrlForMatch(
  url: string,
  origin: string,
): { origin: string; pathname: string } | null {
  try {
    const normalized = new URL(url, origin);

    if (normalized.origin !== origin) {
      return null;
    }

    const pathname = normalized.pathname.replace(/\/+$/, "") || "/";

    return {
      origin: normalized.origin,
      pathname,
    };
  } catch {
    return null;
  }
}

export function resolveNotificationTargetUrl(
  url: string | undefined,
  origin: string,
): string {
  if (!url) {
    return "/";
  }

  if (!isSameOrigin(url, origin)) {
    return "/";
  }

  try {
    const normalized = new URL(url, origin);
    return `${normalized.pathname}${normalized.search}${normalized.hash}` || "/";
  } catch {
    return "/";
  }
}
