import { describe, it, expect } from "vitest";
import {
  NotificationPriority,
  CreateNotificationInputSchema,
  NotificationsFilterSchema,
  NotificationSchema,
  NotificationPreferencesSchema,
  NotificationHistoryResponseSchema,
  UnreadCountResponseSchema,
} from "./notifications";
import type {
  CreateNotificationInput,
  NotificationsFilter,
  Notification,
  NotificationPreferences,
  NotificationHistoryResponse,
  UnreadCountResponse,
} from "./notifications";

describe("NotificationPriority", () => {
  it("contains all required priority values", () => {
    expect(NotificationPriority).toEqual({
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
      URGENT: "urgent",
    });
  });
});

describe("CreateNotificationInputSchema", () => {
  it("validates a valid input with all fields", () => {
    const input = {
      userId: "user-123",
      type: "note_created",
      title: "New note",
      body: "A new note was created",
      priority: "high",
      channel: "in_app",
    };
    const result = CreateNotificationInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      const data: CreateNotificationInput = result.data;
      expect(data.userId).toBe("user-123");
      expect(data.type).toBe("note_created");
      expect(data.title).toBe("New note");
      expect(data.body).toBe("A new note was created");
      expect(data.priority).toBe("high");
      expect(data.channel).toBe("in_app");
    }
  });

  it("validates input with defaults for optional fields", () => {
    const input = {
      userId: "user-123",
      type: "note_created",
      title: "New note",
      body: "A new note was created",
    };
    const result = CreateNotificationInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("medium");
      expect(result.data.channel).toBe("in_app");
    }
  });

  it("rejects input with invalid priority", () => {
    const input = {
      userId: "user-123",
      type: "note_created",
      title: "New note",
      body: "Body",
      priority: "critical",
    };
    const result = CreateNotificationInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects input with empty title", () => {
    const input = {
      userId: "user-123",
      type: "note_created",
      title: "",
      body: "Body",
    };
    const result = CreateNotificationInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects input with missing required fields", () => {
    const input = { userId: "user-123" };
    const result = CreateNotificationInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("NotificationsFilterSchema", () => {
  it("validates a valid filter with all fields", () => {
    const filter = {
      page: 2,
      limit: 10,
      type: "note_created",
      priority: "high",
    };
    const result = NotificationsFilterSchema.safeParse(filter);
    expect(result.success).toBe(true);
    if (result.success) {
      const data: NotificationsFilter = result.data;
      expect(data.page).toBe(2);
      expect(data.limit).toBe(10);
      expect(data.type).toBe("note_created");
      expect(data.priority).toBe("high");
    }
  });

  it("uses default values for page and limit", () => {
    const result = NotificationsFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects page less than 1", () => {
    const result = NotificationsFilterSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = NotificationsFilterSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = NotificationsFilterSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priority in filter", () => {
    const result = NotificationsFilterSchema.safeParse({ priority: "critical" });
    expect(result.success).toBe(false);
  });
});

describe("NotificationSchema", () => {
  it("validates a full notification object", () => {
    const notification = {
      id: "notif-1",
      userId: "user-123",
      type: "note_created",
      title: "New note",
      body: "A new note was created",
      priority: "medium",
      channel: "in_app",
      readAt: null,
      openedAt: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
    };
    const result = NotificationSchema.safeParse(notification);
    expect(result.success).toBe(true);
    if (result.success) {
      const data: Notification = result.data;
      expect(data.id).toBe("notif-1");
      expect(data.readAt).toBeNull();
      expect(data.createdAt).toBeInstanceOf(Date);
    }
  });

  it("validates notification with readAt date", () => {
    const notification = {
      id: "notif-1",
      userId: "user-123",
      type: "note_created",
      title: "New note",
      body: "Body",
      priority: "low",
      channel: "in_app",
      readAt: new Date("2024-01-02T00:00:00Z"),
      openedAt: new Date("2024-01-02T00:00:00Z"),
      createdAt: new Date("2024-01-01T00:00:00Z"),
    };
    const result = NotificationSchema.safeParse(notification);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.readAt).toBeInstanceOf(Date);
    }
  });
});

describe("NotificationPreferencesSchema", () => {
  it("validates full preferences object", () => {
    const prefs = {
      id: "pref-1",
      userId: "user-123",
      inAppEnabled: true,
      pushEnabled: false,
      emailEnabled: true,
      typeSettings: { note_created: { enabled: true } },
      quietHoursStart: 22,
      quietHoursEnd: 7,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const result = NotificationPreferencesSchema.safeParse(prefs);
    expect(result.success).toBe(true);
    if (result.success) {
      const data: NotificationPreferences = result.data;
      expect(data.inAppEnabled).toBe(true);
      expect(data.quietHoursStart).toBe(22);
      expect(data.quietHoursEnd).toBe(7);
    }
  });

  it("validates preferences with null quiet hours", () => {
    const prefs = {
      id: "pref-1",
      userId: "user-123",
      inAppEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      typeSettings: {},
      quietHoursStart: null,
      quietHoursEnd: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = NotificationPreferencesSchema.safeParse(prefs);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quietHoursStart).toBeNull();
      expect(result.data.quietHoursEnd).toBeNull();
    }
  });

  it("rejects quietHoursStart out of range", () => {
    const prefs = {
      id: "pref-1",
      userId: "user-123",
      inAppEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      typeSettings: {},
      quietHoursStart: 25,
      quietHoursEnd: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = NotificationPreferencesSchema.safeParse(prefs);
    expect(result.success).toBe(false);
  });
});

describe("NotificationHistoryResponseSchema", () => {
  it("validates a history response", () => {
    const response = {
      data: [
        {
          id: "notif-1",
          userId: "user-123",
          type: "note_created",
          title: "Test",
          body: "Body",
          priority: "medium",
          channel: "in_app",
          readAt: null,
          openedAt: null,
          createdAt: new Date(),
        },
      ],
      total: 1,
      page: 1,
    };
    const result = NotificationHistoryResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      const data: NotificationHistoryResponse = result.data;
      expect(data.data).toHaveLength(1);
      expect(data.total).toBe(1);
      expect(data.page).toBe(1);
    }
  });
});

describe("UnreadCountResponseSchema", () => {
  it("validates unread count response", () => {
    const response = { count: 5 };
    const result = UnreadCountResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      const data: UnreadCountResponse = result.data;
      expect(data.count).toBe(5);
    }
  });

  it("rejects negative count", () => {
    const result = UnreadCountResponseSchema.safeParse({ count: -1 });
    expect(result.success).toBe(false);
  });
});
