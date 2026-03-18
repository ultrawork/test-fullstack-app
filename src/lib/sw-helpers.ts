export type PushPayload = {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;
  type?: string;
  actions?: unknown;
  requireInteraction?: boolean;
  renotify?: boolean;
  silent?: boolean;
  data?: Record<string, unknown> & { url?: string };
};

export type NotificationData = Record<string, unknown> & {
  url: string;
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
  actions?: unknown[];
};

export function parsePushPayload(jsonText: string | null): PushPayload | null {
  if (!jsonText) {
    return null;
  }

  try {
    return JSON.parse(jsonText) as PushPayload;
  } catch {
    return null;
  }
}

export function buildNotificationOptions(
  payload: PushPayload | null,
): NotificationOptionsLike {
  const isHighOrUrgent =
    payload?.priority === "HIGH" || payload?.priority === "URGENT";

  const requireInteraction =
    payload?.requireInteraction ?? isHighOrUrgent ?? false;

  const tag = payload?.tag || undefined;

  const renotify = tag ? (payload?.renotify ?? isHighOrUrgent ?? false) : false;

  const silent = payload?.silent ?? (payload?.priority === "LOW") ?? false;

  return {
    body: payload?.body || "",
    icon: payload?.icon,
    badge: payload?.badge,
    tag,
    data: {
      ...(payload?.data || {}),
      url: payload?.url || payload?.data?.url || "/",
      _meta: {
        priority: payload?.priority || null,
        type: payload?.type || null,
      },
    },
    requireInteraction,
    renotify,
    silent,
    actions: Array.isArray(payload?.actions)
      ? (payload.actions as unknown[])
      : undefined,
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
