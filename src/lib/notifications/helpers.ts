import { NotificationPriority } from "./types";
import type { QuietHours } from "./types";

/**
 * Проверяет, попадает ли указанный час в диапазон тихих часов.
 * Корректно обрабатывает переход через полночь (start > end).
 * Если start === end — тихие часы отключены.
 *
 * @param quietHours — диапазон тихих часов (start/end: 0–23)
 * @param currentHour — текущий час (0–23)
 * @returns true если currentHour попадает в [start, end)
 */
export function isWithinQuietHours(
  quietHours: QuietHours,
  currentHour: number,
): boolean {
  const { start, end } = quietHours;

  if (start === end) {
    return false;
  }

  if (start < end) {
    return currentHour >= start && currentHour < end;
  }

  // Wrap-around: e.g. start=22, end=7 → quiet from 22 to 7
  return currentHour >= start || currentHour < end;
}

/**
 * Определяет, следует ли доставить уведомление прямо сейчас.
 * - urgent-уведомления доставляются всегда
 * - Если quietHours = null, доставка разрешена
 * - Иначе доставка блокируется внутри тихих часов
 *
 * @param priority — приоритет уведомления
 * @param quietHours — настройки тихих часов (null = отключены)
 * @param currentHour — текущий час (0–23)
 * @returns true если уведомление можно доставить
 */
export function shouldDeliverNow(
  priority: NotificationPriority,
  quietHours: QuietHours | null,
  currentHour: number,
): boolean {
  if (priority === NotificationPriority.URGENT) {
    return true;
  }

  if (quietHours === null) {
    return true;
  }

  return !isWithinQuietHours(quietHours, currentHour);
}
