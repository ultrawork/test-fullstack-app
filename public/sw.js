/**
 * Service Worker — обработка push-уведомлений.
 *
 * Ожидаемый формат payload (JSON):
 * {
 *   title?:            string,
 *   body?:             string,
 *   icon?:             string,
 *   badge?:            string,
 *   tag?:              string,
 *   url?:              string,    // URL для открытия при клике
 *   priority?:         'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
 *   type?:             string,
 *   actions?:          NotificationAction[],
 *   requireInteraction?: boolean,
 *   renotify?:         boolean,
 *   silent?:           boolean,
 *   data?:             object,    // произвольные данные; data.url используется как fallback URL
 * }
 *
 * Регистрация (рекомендация для usePushSubscription):
 *   navigator.serviceWorker.register('/sw.js?v=' + CACHE_VERSION)
 * Версионирование query-параметром обходит агрессивное кеширование статики.
 */

// ---------------------------------------------------------------------------
// Версионирование
// ---------------------------------------------------------------------------

/** @type {string} Версия кэша. При изменении старые кэши автоматически удаляются. */
const CACHE_VERSION = 'v1';
const CACHE_PREFIX = 'notes-web-sw';

/** Имя текущего кэша. */
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;

/** Версия SW — используется для диагностики и ответов на сообщения клиента. */
const SW_VERSION = CACHE_VERSION;

// ---------------------------------------------------------------------------
// install — открываем текущий кэш и немедленно активируем SW
// ---------------------------------------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME));
  self.skipWaiting();
});

// ---------------------------------------------------------------------------
// activate — очищаем устаревшие кэши и забираем управление всеми клиентами
// ---------------------------------------------------------------------------

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// ---------------------------------------------------------------------------
// Вспомогательные функции
// ---------------------------------------------------------------------------

/**
 * Безопасно парсит данные push-события.
 * Сначала пробует event.data.json(), при неудаче — JSON.parse(event.data.text()).
 *
 * @param {PushEvent} event
 * @returns {object|null}
 */
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

/**
 * Проверяет, принадлежит ли URL тому же origin, что и SW.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isSameOrigin(url) {
  try {
    return new URL(url, self.location.origin).origin === self.location.origin;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// push — отображение уведомления
// ---------------------------------------------------------------------------

self.addEventListener('push', (event) => {
  const payload = parsePushPayload(event);

  const isHighOrUrgent =
    payload?.priority === 'HIGH' || payload?.priority === 'URGENT';

  const title = payload?.title || 'Notification';

  /** @type {NotificationOptions} */
  const options = {
    body: payload?.body || '',
    ...(payload?.icon !== undefined && { icon: payload.icon }),
    ...(payload?.badge !== undefined && { badge: payload.badge }),
    tag: payload?.tag || undefined,
    data: {
      url: payload?.url || payload?.data?.url || '/',
      ...payload?.data,
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
    renotify:
      payload?.renotify !== undefined ? payload.renotify : isHighOrUrgent,
    silent:
      payload?.silent !== undefined
        ? payload.silent
        : payload?.priority === 'LOW',
    ...(Array.isArray(payload?.actions) && { actions: payload.actions }),
    timestamp: Date.now(),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ---------------------------------------------------------------------------
// notificationclick — открытие/фокус нужной вкладки
// ---------------------------------------------------------------------------

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification?.data?.url || '/';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      const targetUrl = isSameOrigin(urlToOpen)
        ? new URL(urlToOpen, self.location.origin).href
        : urlToOpen;

      const matchingClient = allClients.find(
        (c) => c.url === targetUrl,
      );

      if (matchingClient && 'focus' in matchingClient) {
        return matchingClient.focus();
      }

      return self.clients.openWindow(targetUrl);
    })(),
  );
});

// ---------------------------------------------------------------------------
// message — служебные команды от приложения
// ---------------------------------------------------------------------------

self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.source?.postMessage({
        type: 'SW_VERSION',
        payload: { sw: SW_VERSION, cache: CACHE_NAME },
      });
      break;

    default:
      break;
  }
});
