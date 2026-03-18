/** Notification priority levels */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/** Notification record as stored in the database */
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  channel: string;
  readAt: Date | null;
  openedAt: Date | null;
  createdAt: Date;
}

/** User notification preferences */
export interface NotificationPreferences {
  id: string;
  userId: string;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  typeSettings: Record<string, unknown>;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Input for creating a notification */
export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  priority?: NotificationPriority;
  channel?: string;
}

/** Filter for notification history query */
export interface NotificationsFilter {
  page?: number;
  limit?: number;
  type?: string;
  priority?: NotificationPriority;
}

/** Paginated notifications result */
export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
}

/** Prisma notification model delegate interface */
export interface NotificationDelegate {
  create(args: {
    data: {
      userId: string;
      type: string;
      title: string;
      body: string;
      priority: NotificationPriority;
      channel: string;
    };
  }): Promise<Notification>;
  updateMany(args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<{ count: number }>;
  findUnique(args: { where: { id: string } }): Promise<Notification | null>;
  findMany(args: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, string>;
    skip?: number;
    take?: number;
  }): Promise<Notification[]>;
  count(args: { where?: Record<string, unknown> }): Promise<number>;
}

/** Prisma notification preferences model delegate interface */
export interface NotificationPreferencesDelegate {
  findUnique(args: {
    where: { userId: string };
  }): Promise<NotificationPreferences | null>;
  create(args: {
    data: {
      userId: string;
      inAppEnabled: boolean;
      pushEnabled: boolean;
      emailEnabled: boolean;
      typeSettings: Record<string, unknown>;
      quietHoursStart: number | null;
      quietHoursEnd: number | null;
    };
  }): Promise<NotificationPreferences>;
}

/** Prisma client interface (subset used by NotificationService) */
export interface PrismaLike {
  notification: NotificationDelegate;
  notificationPreferences: NotificationPreferencesDelegate;
}

/** Redis client interface (subset used by NotificationService) */
export interface RedisLike {
  publish(channel: string, message: string): Promise<number>;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * Service for managing user notifications.
 * Handles creation, reading, filtering, and real-time delivery via Redis pub/sub.
 */
export class NotificationService {
  private readonly prisma: PrismaLike;
  private readonly redis: RedisLike;

  constructor(prisma: PrismaLike, redis: RedisLike) {
    this.prisma = prisma;
    this.redis = redis;
  }

  /** Creates a notification, checks user preferences, and publishes to Redis */
  async create(input: CreateNotificationInput): Promise<Notification> {
    const prefs = await this.getOrCreatePreferences(input.userId);

    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        priority: input.priority ?? 'medium',
        channel: input.channel ?? 'in_app',
      },
    });

    if (prefs.inAppEnabled && this.shouldDeliverNow(input.userId, prefs)) {
      await this.redis.publish(
        `user:${input.userId}:notifications`,
        JSON.stringify(notification),
      );
    }

    return notification;
  }

  /** Marks a single notification as read by id and userId */
  async markRead(id: string, userId: string): Promise<Notification | null> {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });

    return this.prisma.notification.findUnique({ where: { id } });
  }

  /** Marks all unread notifications as read for a user */
  async markAllRead(userId: string): Promise<{ count: number }> {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  /** Gets all unread notifications for a user, sorted by createdAt desc */
  async getUnread(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId, readAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Gets notification history with pagination and filtering */
  async getHistory(
    userId: string,
    filter: NotificationsFilter,
  ): Promise<PaginatedNotifications> {
    const page = filter.page ?? DEFAULT_PAGE;
    const limit = filter.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (filter.type) {
      where.type = filter.type;
    }
    if (filter.priority) {
      where.priority = filter.priority;
    }

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total, page };
  }

  /** Gets the count of unread notifications for a user */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  /** Checks if notification should be delivered now based on quiet hours */
  private shouldDeliverNow(
    _userId: string,
    prefs: NotificationPreferences,
  ): boolean {
    if (prefs.quietHoursStart === null || prefs.quietHoursEnd === null) {
      return true;
    }

    const currentHour = new Date().getUTCHours();
    const start = prefs.quietHoursStart;
    const end = prefs.quietHoursEnd;

    if (start < end) {
      return currentHour < start || currentHour >= end;
    }

    if (start > end) {
      return currentHour >= end && currentHour < start;
    }

    return true;
  }

  /** Gets or creates notification preferences for a user with defaults */
  private async getOrCreatePreferences(
    userId: string,
  ): Promise<NotificationPreferences> {
    const existing = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.notificationPreferences.create({
      data: {
        userId,
        inAppEnabled: true,
        pushEnabled: true,
        emailEnabled: true,
        typeSettings: {},
        quietHoursStart: null,
        quietHoursEnd: null,
      },
    });
  }
}
