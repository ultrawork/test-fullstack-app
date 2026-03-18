import { z } from "zod";

/** Notification priority levels */
export const NotificationPriority = {
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "urgent",
} as const;

export type NotificationPriority =
  (typeof NotificationPriority)[keyof typeof NotificationPriority];

/** Zod schema for creating a notification via POST */
export const CreateNotificationSchema = z.object({
  type: z.string().min(1, "type is required"),
  title: z.string().min(1, "title is required"),
  body: z.string().min(1, "body is required"),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional()
    .default("medium"),
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;

/** Zod schema for GET query params (pagination + filters) */
export const NotificationsFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export type NotificationsFilter = z.infer<typeof NotificationsFilterSchema>;

/** Shape of a notification record returned from the service */
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  channel: string | null;
  readAt: Date | null;
  openedAt: Date | null;
  createdAt: Date;
}

/** Paginated history response */
export interface NotificationHistoryResult {
  data: Notification[];
  total: number;
  page: number;
}

/** Standard API envelope */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
