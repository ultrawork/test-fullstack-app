import type {
  CreateNotificationInput,
  Notification,
  NotificationHistoryResult,
  NotificationsFilter,
} from "@/types/notifications";

/**
 * Notification service interface.
 * Stub — real implementation will be provided by unit-4.
 */
export class NotificationService {
  /** Create a new notification */
  async create(
    ...args: [input: CreateNotificationInput & { userId: string }]
  ): Promise<Notification> {
    void args;
    throw new Error("NotificationService.create not implemented");
  }

  /** Mark a single notification as read */
  async markRead(
    ...args: [id: string, userId: string]
  ): Promise<Notification | null> {
    void args;
    throw new Error("NotificationService.markRead not implemented");
  }

  /** Mark all unread notifications as read for a user */
  async markAllRead(...args: [userId: string]): Promise<{ count: number }> {
    void args;
    throw new Error("NotificationService.markAllRead not implemented");
  }

  /** Get paginated notification history with filters */
  async getHistory(
    ...args: [userId: string, filter: NotificationsFilter]
  ): Promise<NotificationHistoryResult> {
    void args;
    throw new Error("NotificationService.getHistory not implemented");
  }

  /** Get count of unread notifications */
  async getUnreadCount(...args: [userId: string]): Promise<number> {
    void args;
    throw new Error("NotificationService.getUnreadCount not implemented");
  }
}

export const notificationService = new NotificationService();
