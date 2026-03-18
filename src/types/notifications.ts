import { z } from "zod";

/**
 * Notification priority levels matching Prisma enum NotificationPriority.
 */
export const NotificationPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type NotificationPriorityValue =
  (typeof NotificationPriority)[keyof typeof NotificationPriority];

const priorityValues = [
  NotificationPriority.LOW,
  NotificationPriority.MEDIUM,
  NotificationPriority.HIGH,
  NotificationPriority.URGENT,
] as const;

/** Zod schema for notification priority validation. */
export const NotificationPrioritySchema = z.enum(priorityValues);

/** Zod schema for creating a new notification. */
export const CreateNotificationInputSchema = z.object({
  userId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  priority: NotificationPrioritySchema.default("medium"),
  channel: z.string().default("in_app"),
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationInputSchema>;

/** Zod schema for filtering/paginating notification history. */
export const NotificationsFilterSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  type: z.string().optional(),
  priority: NotificationPrioritySchema.optional(),
});

export type NotificationsFilter = z.infer<typeof NotificationsFilterSchema>;

/** Zod schema for a full notification record (as stored in DB). */
export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  priority: z.string(),
  channel: z.string(),
  readAt: z.date().nullable(),
  openedAt: z.date().nullable(),
  createdAt: z.date(),
});

export type Notification = z.infer<typeof NotificationSchema>;

/** Zod schema for user notification preferences. */
export const NotificationPreferencesSchema = z.object({
  id: z.string(),
  userId: z.string(),
  inAppEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  typeSettings: z.record(z.unknown()),
  quietHoursStart: z.number().int().min(0).max(23).nullable(),
  quietHoursEnd: z.number().int().min(0).max(23).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

/** Zod schema for paginated notification history response. */
export const NotificationHistoryResponseSchema = z.object({
  data: z.array(NotificationSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
});

export type NotificationHistoryResponse = z.infer<typeof NotificationHistoryResponseSchema>;

/** Zod schema for unread count response. */
export const UnreadCountResponseSchema = z.object({
  count: z.number().int().min(0),
});

export type UnreadCountResponse = z.infer<typeof UnreadCountResponseSchema>;

/** Standard API success response wrapper. */
export const ApiSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};
