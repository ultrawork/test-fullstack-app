/** Priority levels for notifications. */
export enum NotificationPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Urgent = "urgent",
}

/** Types of events that trigger notifications. */
export enum NotificationType {
  NoteCreated = "note_created",
  NoteMentioned = "note_mentioned",
  NoteUpdated = "note_updated",
  NoteCommented = "note_commented",
  BackupComplete = "backup_complete",
  QuotaExceeded = "quota_exceeded",
}

/** Delivery channels for notifications. */
export enum NotificationChannel {
  Push = "push",
  Email = "email",
  InApp = "in_app",
}

/** Time range when non-urgent notifications are suppressed. */
export interface QuietHours {
  /** Hour of day (0-23) when quiet period starts. */
  start: number;
  /** Hour of day (0-23) when quiet period ends. */
  end: number;
}

/** Per-channel enable/disable preferences. */
export interface ChannelPrefs {
  push: boolean;
  email: boolean;
  inApp: boolean;
}

/** User notification preferences. */
export interface NotificationPreferences {
  userId: string;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  quietHours?: QuietHours;
  /** Per notification-type channel overrides. */
  typeSettings: Partial<Record<NotificationType, ChannelPrefs>>;
}

/** Input data for creating a new notification. */
export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority?: NotificationPriority;
}

/** Payload sent to the browser push API. */
export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  type: NotificationType;
  notificationId: string;
}

/** Result returned after creating a notification. */
export interface NotificationCreateResult {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  createdAt: Date;
  channels: NotificationChannel[];
}
