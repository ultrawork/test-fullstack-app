/**
 * Service Worker — обработка push-уведомлений.
 *
 * Ожидаемый формат payload (JSON):
 * {
 *   title?: string,
 *   body?: string,
 *   icon?: string,
 *   badge?: string,
 *   tag?: string,
 *   url?: string,
 *   priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
 *   type?: string,
 *   actions?: NotificationAction[],
 *   requireInteraction?: boolean,
 *   renotify?: boolean,
 *   silent?: boolean,
 *   data?: object,
 * }
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

function parsePushPayload(event) {
  if (!event.data) return null;

  try {
    return event.data.json();
  } catch {
    try {
      return JSON.parse(event.data.text());
    } catch {
      return null;
    }
  }
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

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);
  const isHighOrUrgent =
    payload?.priority === "HIGH" || payload?.priority === "URGENT";
  const title = payload?.title || "Notification";

  const options = {
    body: payload?.body || "",
    ...(payload?.icon !== undefined && { icon: payload.icon }),
    ...(payload?.badge !== undefined && { badge: payload.badge }),
    tag: payload?.tag || undefined,
    data: {
      ...payload?.data,
      url: payload?.url || payload?.data?.url || "/",
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
    ...(Array.isArray(payload?.actions) && { actions: payload.actions }),
    timestamp: Date.now(),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = resolveNotificationTargetUrl(event.notification?.data?.url);

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
