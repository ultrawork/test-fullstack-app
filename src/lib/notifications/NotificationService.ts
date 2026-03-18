import {
  CreateNotificationInput,
  NotificationPriority,
  NotificationChannel,
  NotificationCreateResult,
  NotificationPreferences,
  PushPayload,
} from "./types";

/** Interface for push notification delivery (provided by unit-2). */
export interface IPushService {
  /** Sends a push notification. Returns true on success, false on failure. */
  sendPush(userId: string, payload: PushPayload): Promise<boolean>;
}

/** Signature for the shouldDeliverNow helper (provided by unit-3). */
export type ShouldDeliverNowFn = (
  preferences: NotificationPreferences,
  priority: NotificationPriority,
  currentHour: number,
) => boolean;

/** Dependencies injected into NotificationService. */
export interface NotificationServiceDeps {
  pushService: IPushService;
  shouldDeliverNow: ShouldDeliverNowFn;
  /** Custom ID generator (defaults to crypto.randomUUID). */
  generateId?: () => string;
  /** Custom clock (defaults to () => new Date()). */
  getNow?: () => Date;
}

/**
 * Orchestrates notification creation.
 *
 * Uses dependency injection for push delivery and delivery-timing logic.
 * Only the PUSH channel is supported in this implementation.
 */
export class NotificationService {
  private readonly pushService: IPushService;
  private readonly shouldDeliverNow: ShouldDeliverNowFn;
  private readonly generateId: () => string;
  private readonly getNow: () => Date;

  constructor(deps: NotificationServiceDeps) {
    this.pushService = deps.pushService;
    this.shouldDeliverNow = deps.shouldDeliverNow;
    this.generateId = deps.generateId ?? (() => crypto.randomUUID());
    this.getNow = deps.getNow ?? (() => new Date());
  }

  /**
   * Creates a notification, checks delivery rules, and sends push if applicable.
   *
   * @param input - Notification data (userId, type, title, body, priority).
   * @param preferences - User notification preferences (push enabled, quiet hours, etc.).
   * @returns Result with notification metadata and list of channels used for delivery.
   */
  async create(
    input: CreateNotificationInput,
    preferences: NotificationPreferences,
  ): Promise<NotificationCreateResult> {
    const priority = input.priority ?? NotificationPriority.Medium;
    const now = this.getNow();
    const currentHour = now.getUTCHours();
    const id = this.generateId();
    const channels: NotificationChannel[] = [];

    const deliver = this.shouldDeliverNow(preferences, priority, currentHour);

    if (deliver && preferences.pushEnabled) {
      const payload: PushPayload = {
        title: input.title,
        body: input.body,
        type: input.type,
        notificationId: id,
      };

      const sent = await this.pushService.sendPush(input.userId, payload);
      if (sent) {
        channels.push(NotificationChannel.Push);
      }
    }

    return {
      id,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      priority,
      createdAt: now,
      channels,
    };
  }
}
