/**
 * Приоритет уведомления.
 * urgent — всегда доставляется, даже в quiet hours.
 */
export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

/** Тип уведомления */
export type NotificationType =
  | "note_created"
  | "note_mentioned"
  | "note_updated"
  | "note_commented"
  | "backup_complete"
  | "quota_exceeded";

/** Канал доставки */
export type NotificationChannel = "push" | "email" | "in_app";

/** Тихие часы (start/end — часы 0–23) */
export interface QuietHours {
  start: number;
  end: number;
}

/** Настройки канала для конкретного типа уведомлений */
export interface ChannelPrefs {
  push: boolean;
  email: boolean;
  inApp: boolean;
}

/** Пользовательские настройки уведомлений */
export interface NotificationPreferences {
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  typeSettings: Partial<Record<NotificationType, ChannelPrefs>>;
  quietHours: QuietHours | null;
}

/** Входные данные для создания уведомления */
export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority?: NotificationPriority;
}

/** Payload для push-уведомления */
export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

/** Результат создания уведомления */
export interface NotificationCreateResult {
  id: string;
  delivered: boolean;
  channels: NotificationChannel[];
}
