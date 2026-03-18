/**
 * Service Worker — обработка push-уведомлений.
 *
 * Логика ниже синхронизирована с src/lib/sw-helpers.ts.
 * Если формат payload или notification options меняется,
 * обновляй helper и этот файл вместе, потому что SW выполняется отдельно от app bundle.
 */

const CACHE_VERSION = "v1";
const CACHE_PREFIX = "notes-web-sw";
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;
const SW_VERSION = CACHE_VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizePayloadActions(actions) {
  if (!Array.isArray(actions)) {
    return undefined;
  }

  return actions.filter(
    (action) =>
      isPlainObject(action) &&
      typeof action.action === "string" &&
      typeof action.title === "string",
  );
}

function normalizeActionUrls(actionUrls) {
  if (!isPlainObject(actionUrls)) {
    return undefined;
  }

  const normalizedEntries = Object.entries(actionUrls).filter(
    ([key, value]) => typeof key === "string" && typeof value === "string",
  );

  return normalizedEntries.length > 0
    ? Object.fromEntries(normalizedEntries)
    : undefined;
}

function parsePushPayload(event) {
  if (!event.data) return null;

  try {
    const parsed = event.data.json();
    return isPlainObject(parsed) ? parsed : null;
  } catch {
    try {
      const parsed = JSON.parse(event.data.text());
      return isPlainObject(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

function buildNotificationOptions(payload) {
  const isHighOrUrgent =
    payload?.priority === "HIGH" || payload?.priority === "URGENT";
  const payloadData = isPlainObject(payload?.data) ? payload.data : undefined;
  const normalizedActions = normalizePayloadActions(payload?.actions);
  const actionUrls =
    normalizeActionUrls(payload?.actionUrls) ||
    normalizeActionUrls(payloadData?.actionUrls);

  return {
    body: payload?.body || "",
    ...(payload?.icon !== undefined && { icon: payload.icon }),
    ...(payload?.badge !== undefined && { badge: payload.badge }),
    tag: payload?.tag || undefined,
    data: {
      ...(payloadData || {}),
      url: payload?.url || payloadData?.url || "/",
      ...(actionUrls && { actionUrls }),
      ...(normalizedActions && { actions: normalizedActions }),
      _meta: {
        swVersion: SW_VERSION,
        receivedAt: Date.now(),
        priority: payload?.priority || null,
        type: payload?.type || null,
      },
    },
    requireInteraction:
      payload?.requireInteraction !== undefined
        ? payload.requireInteraction
        : isHighOrUrgent,
    renotify: payload?.tag
      ? payload?.renotify !== undefined
        ? payload.renotify
        : isHighOrUrgent
      : false,
    silent:
      payload?.silent !== undefined
        ? payload.silent
        : payload?.priority === "LOW",
    ...(normalizedActions && { actions: normalizedActions }),
    timestamp: Date.now(),
  };
}

function isSameOrigin(url) {
  try {
    return new URL(url, self.location.origin).origin === self.location.origin;
  } catch {
    return false;
  }
}

function normalizeUrlForMatch(url) {
  try {
    const normalized = new URL(url, self.location.origin);

    if (normalized.origin !== self.location.origin) {
      return null;
    }

    return {
      origin: normalized.origin,
      pathname: normalized.pathname.replace(/\/+$/, "") || "/",
    };
  } catch {
    return null;
  }
}

function resolveNotificationTargetUrl(url) {
  if (!url || !isSameOrigin(url)) {
    return "/";
  }

  try {
    const normalized = new URL(url, self.location.origin);
    return `${normalized.pathname}${normalized.search}${normalized.hash}` || "/";
  } catch {
    return "/";
  }
}

function resolveNotificationClickUrl(notification, action) {
  const data = isPlainObject(notification?.data) ? notification.data : undefined;

  if (action) {
    const actionUrls = normalizeActionUrls(data?.actionUrls);

    if (actionUrls?.[action]) {
      return resolveNotificationTargetUrl(actionUrls[action]);
    }

    const actions = normalizePayloadActions(data?.actions);
    const matchingAction = actions?.find((item) => item.action === action);

    if (matchingAction && data?.url) {
      return resolveNotificationTargetUrl(data.url);
    }
  }

  return resolveNotificationTargetUrl(data?.url);
}

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);
  const title = payload?.title || "Notification";
  const options = buildNotificationOptions(payload);

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = resolveNotificationClickUrl(
    event.notification,
    event.action || "",
  );

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const targetMatch = normalizeUrlForMatch(urlToOpen);

      if (targetMatch) {
        const matchingClient = allClients.find((client) => {
          const clientMatch = normalizeUrlForMatch(client.url);

          return (
            clientMatch !== null &&
            clientMatch.origin === targetMatch.origin &&
            clientMatch.pathname === targetMatch.pathname
          );
        });

        if (matchingClient && "focus" in matchingClient) {
          return matchingClient.focus();
        }
      }

      return self.clients.openWindow(urlToOpen);
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "GET_VERSION":
      event.source?.postMessage({
        type: "SW_VERSION",
        payload: { sw: SW_VERSION, cache: CACHE_NAME },
      });
      break;

    default:
      break;
  }
});
