import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  NotificationService,
  type PrismaLike,
  type RedisLike,
  type Notification,
  type NotificationPreferences,
  type CreateNotificationInput,
} from './NotificationService';

function createMockNotification(
  overrides: Partial<Notification> = {},
): Notification {
  return {
    id: 'notif-1',
    userId: 'user-1',
    type: 'info',
    title: 'Test',
    body: 'Test body',
    priority: 'medium',
    channel: 'in_app',
    readAt: null,
    openedAt: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

function createMockPreferences(
  overrides: Partial<NotificationPreferences> = {},
): NotificationPreferences {
  return {
    id: 'pref-1',
    userId: 'user-1',
    inAppEnabled: true,
    pushEnabled: true,
    emailEnabled: true,
    typeSettings: {},
    quietHoursStart: null,
    quietHoursEnd: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

function createMockPrisma(): PrismaLike {
  return {
    notification: {
      create: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    notificationPreferences: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };
}

function createMockRedis(): RedisLike {
  return {
    publish: vi.fn().mockResolvedValue(1),
  };
}

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: PrismaLike;
  let redis: RedisLike;

  beforeEach(() => {
    prisma = createMockPrisma();
    redis = createMockRedis();
    service = new NotificationService(prisma, redis);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    const input: CreateNotificationInput = {
      userId: 'user-1',
      type: 'note_created',
      title: 'New note',
      body: 'A note was created',
    };

    it('creates a notification with default priority and channel', async () => {
      const notification = createMockNotification();
      const prefs = createMockPreferences();

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        prefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      const result = await service.create(input);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'note_created',
          title: 'New note',
          body: 'A note was created',
          priority: 'medium',
          channel: 'in_app',
        },
      });
      expect(result).toEqual(notification);
    });

    it('uses provided priority and channel', async () => {
      const notification = createMockNotification({
        priority: 'urgent',
        channel: 'push',
      });
      const prefs = createMockPreferences();

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        prefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      await service.create({ ...input, priority: 'urgent', channel: 'push' });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          priority: 'urgent',
          channel: 'push',
        }),
      });
    });

    it('publishes to Redis when in-app enabled and outside quiet hours', async () => {
      const notification = createMockNotification();
      const prefs = createMockPreferences();

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        prefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      await service.create(input);

      expect(redis.publish).toHaveBeenCalledWith(
        'user:user-1:notifications',
        JSON.stringify(notification),
      );
    });

    it('does not publish to Redis when in-app is disabled', async () => {
      const notification = createMockNotification();
      const prefs = createMockPreferences({ inAppEnabled: false });

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        prefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      await service.create(input);

      expect(redis.publish).not.toHaveBeenCalled();
    });

    it('does not publish during quiet hours (daytime range)', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T14:00:00Z'));

      const notification = createMockNotification();
      const prefs = createMockPreferences({
        quietHoursStart: 9,
        quietHoursEnd: 17,
      });

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        prefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      await service.create(input);

      expect(redis.publish).not.toHaveBeenCalled();
    });

    it('does not publish during quiet hours (nighttime range)', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T23:00:00Z'));

      const notification = createMockNotification();
      const prefs = createMockPreferences({
        quietHoursStart: 22,
        quietHoursEnd: 8,
      });

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        prefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      await service.create(input);

      expect(redis.publish).not.toHaveBeenCalled();
    });

    it('publishes outside daytime quiet hours range', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T18:00:00Z'));

      const notification = createMockNotification();
      const prefs = createMockPreferences({
        quietHoursStart: 9,
        quietHoursEnd: 17,
      });

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        prefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      await service.create(input);

      expect(redis.publish).toHaveBeenCalled();
    });

    it('publishes outside nighttime quiet hours range', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

      const notification = createMockNotification();
      const prefs = createMockPreferences({
        quietHoursStart: 22,
        quietHoursEnd: 8,
      });

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        prefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      await service.create(input);

      expect(redis.publish).toHaveBeenCalled();
    });

    it('delivers when quietHoursStart equals quietHoursEnd', async () => {
      const notification = createMockNotification();
      const prefs = createMockPreferences({
        quietHoursStart: 10,
        quietHoursEnd: 10,
      });

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        prefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      await service.create(input);

      expect(redis.publish).toHaveBeenCalled();
    });

    it('creates preferences when none exist', async () => {
      const notification = createMockNotification();
      const newPrefs = createMockPreferences();

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        null,
      );
      vi.mocked(prisma.notificationPreferences.create).mockResolvedValue(
        newPrefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      await service.create(input);

      expect(prisma.notificationPreferences.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          inAppEnabled: true,
          pushEnabled: true,
          emailEnabled: true,
          typeSettings: {},
          quietHoursStart: null,
          quietHoursEnd: null,
        },
      });
    });

    it('uses existing preferences without creating new ones', async () => {
      const notification = createMockNotification();
      const existingPrefs = createMockPreferences();

      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue(
        existingPrefs,
      );
      vi.mocked(prisma.notification.create).mockResolvedValue(notification);

      await service.create(input);

      expect(prisma.notificationPreferences.create).not.toHaveBeenCalled();
    });
  });

  describe('markRead', () => {
    it('marks notification as read and returns updated record', async () => {
      const updated = createMockNotification({
        readAt: new Date('2024-01-02T00:00:00Z'),
      });
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.notification.findUnique).mockResolvedValue(updated);

      const result = await service.markRead('notif-1', 'user-1');

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { readAt: expect.any(Date) },
      });
      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
      });
      expect(result).toEqual(updated);
    });

    it('returns null when notification not found', async () => {
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 0 });
      vi.mocked(prisma.notification.findUnique).mockResolvedValue(null);

      const result = await service.markRead('nonexistent', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('markAllRead', () => {
    it('marks all unread notifications as read', async () => {
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 5 });

      const result = await service.markAllRead('user-1');

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
        data: { readAt: expect.any(Date) },
      });
      expect(result).toEqual({ count: 5 });
    });

    it('returns zero count when no unread notifications', async () => {
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 0 });

      const result = await service.markAllRead('user-1');

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('getUnread', () => {
    it('returns unread notifications sorted by createdAt desc', async () => {
      const notifications = [
        createMockNotification({ id: '1' }),
        createMockNotification({ id: '2' }),
      ];
      vi.mocked(prisma.notification.findMany).mockResolvedValue(notifications);

      const result = await service.getUnread('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(notifications);
    });

    it('returns empty array when no unread notifications', async () => {
      vi.mocked(prisma.notification.findMany).mockResolvedValue([]);

      const result = await service.getUnread('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getHistory', () => {
    it('returns paginated notifications with defaults', async () => {
      const notifications = [createMockNotification()];
      vi.mocked(prisma.notification.findMany).mockResolvedValue(notifications);
      vi.mocked(prisma.notification.count).mockResolvedValue(1);

      const result = await service.getHistory('user-1', {});

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual({ data: notifications, total: 1, page: 1 });
    });

    it('applies type filter', async () => {
      vi.mocked(prisma.notification.findMany).mockResolvedValue([]);
      vi.mocked(prisma.notification.count).mockResolvedValue(0);

      await service.getHistory('user-1', { type: 'alert' });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', type: 'alert' },
        }),
      );
    });

    it('applies priority filter', async () => {
      vi.mocked(prisma.notification.findMany).mockResolvedValue([]);
      vi.mocked(prisma.notification.count).mockResolvedValue(0);

      await service.getHistory('user-1', { priority: 'high' });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', priority: 'high' },
        }),
      );
    });

    it('applies both type and priority filters', async () => {
      vi.mocked(prisma.notification.findMany).mockResolvedValue([]);
      vi.mocked(prisma.notification.count).mockResolvedValue(0);

      await service.getHistory('user-1', { type: 'alert', priority: 'high' });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', type: 'alert', priority: 'high' },
        }),
      );
    });

    it('calculates correct skip for pagination', async () => {
      vi.mocked(prisma.notification.findMany).mockResolvedValue([]);
      vi.mocked(prisma.notification.count).mockResolvedValue(50);

      const result = await service.getHistory('user-1', {
        page: 3,
        limit: 10,
      });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.page).toBe(3);
      expect(result.total).toBe(50);
    });

    it('runs findMany and count in parallel', async () => {
      const findManyPromise = new Promise<Notification[]>((resolve) => {
        setTimeout(() => resolve([]), 10);
      });
      const countPromise = new Promise<number>((resolve) => {
        setTimeout(() => resolve(0), 10);
      });

      vi.mocked(prisma.notification.findMany).mockReturnValue(
        findManyPromise as Promise<Notification[]>,
      );
      vi.mocked(prisma.notification.count).mockReturnValue(
        countPromise as Promise<number>,
      );

      const result = await service.getHistory('user-1', {});

      expect(prisma.notification.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.notification.count).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: [], total: 0, page: 1 });
    });
  });

  describe('getUnreadCount', () => {
    it('returns count of unread notifications', async () => {
      vi.mocked(prisma.notification.count).mockResolvedValue(42);

      const result = await service.getUnreadCount('user-1');

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
      });
      expect(result).toBe(42);
    });

    it('returns zero when no unread', async () => {
      vi.mocked(prisma.notification.count).mockResolvedValue(0);

      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(0);
    });
  });
});
