import { describe, it, expect } from "vitest";
import {
  NotificationPriority,
  NotificationType,
  NotificationChannel,
} from "./types";
import type {
  QuietHours,
  ChannelPrefs,
  NotificationPreferences,
  CreateNotificationInput,
  PushPayload,
  NotificationCreateResult,
} from "./types";

describe("NotificationPriority enum", () => {
  it("has exactly 4 values: low, medium, high, urgent", () => {
    expect(NotificationPriority.Low).toBe("low");
    expect(NotificationPriority.Medium).toBe("medium");
    expect(NotificationPriority.High).toBe("high");
    expect(NotificationPriority.Urgent).toBe("urgent");

    const values = Object.values(NotificationPriority);
    expect(values).toHaveLength(4);
  });
});

describe("NotificationType enum", () => {
  it("has exactly 6 values for notification types", () => {
    expect(NotificationType.NoteCreated).toBe("note_created");
    expect(NotificationType.NoteMentioned).toBe("note_mentioned");
    expect(NotificationType.NoteUpdated).toBe("note_updated");
    expect(NotificationType.NoteCommented).toBe("note_commented");
    expect(NotificationType.BackupComplete).toBe("backup_complete");
    expect(NotificationType.QuotaExceeded).toBe("quota_exceeded");

    const values = Object.values(NotificationType);
    expect(values).toHaveLength(6);
  });
});

describe("NotificationChannel enum", () => {
  it("has exactly 3 values: push, email, in_app", () => {
    expect(NotificationChannel.Push).toBe("push");
    expect(NotificationChannel.Email).toBe("email");
    expect(NotificationChannel.InApp).toBe("in_app");

    const values = Object.values(NotificationChannel);
    expect(values).toHaveLength(3);
  });
});

describe("QuietHours interface", () => {
  it("accepts valid quiet hours configuration", () => {
    const quietHours: QuietHours = {
      start: 22,
      end: 8,
    };
    expect(quietHours.start).toBe(22);
    expect(quietHours.end).toBe(8);
  });
});

describe("ChannelPrefs interface", () => {
  it("accepts valid channel preferences", () => {
    const prefs: ChannelPrefs = {
      push: true,
      email: false,
      inApp: true,
    };
    expect(prefs.push).toBe(true);
    expect(prefs.email).toBe(false);
    expect(prefs.inApp).toBe(true);
  });
});

describe("NotificationPreferences interface", () => {
  it("accepts full preferences with quiet hours and type settings", () => {
    const preferences: NotificationPreferences = {
      userId: "user-123",
      inAppEnabled: true,
      pushEnabled: false,
      emailEnabled: true,
      quietHours: { start: 22, end: 7 },
      typeSettings: {
        [NotificationType.NoteCreated]: {
          push: true,
          email: true,
          inApp: true,
        },
      },
    };
    expect(preferences.userId).toBe("user-123");
    expect(preferences.inAppEnabled).toBe(true);
    expect(preferences.pushEnabled).toBe(false);
    expect(preferences.quietHours?.start).toBe(22);
  });

  it("accepts preferences without optional fields", () => {
    const preferences: NotificationPreferences = {
      userId: "user-456",
      inAppEnabled: true,
      pushEnabled: false,
      emailEnabled: false,
      typeSettings: {},
    };
    expect(preferences.quietHours).toBeUndefined();
  });
});

describe("CreateNotificationInput interface", () => {
  it("accepts input with all fields", () => {
    const input: CreateNotificationInput = {
      userId: "user-123",
      type: NotificationType.NoteCreated,
      title: "New note",
      body: "A note was created",
      priority: NotificationPriority.High,
    };
    expect(input.userId).toBe("user-123");
    expect(input.type).toBe(NotificationType.NoteCreated);
    expect(input.priority).toBe(NotificationPriority.High);
  });

  it("accepts input without optional priority", () => {
    const input: CreateNotificationInput = {
      userId: "user-123",
      type: NotificationType.BackupComplete,
      title: "Backup done",
      body: "Your backup is complete",
    };
    expect(input.priority).toBeUndefined();
  });
});

describe("PushPayload interface", () => {
  it("accepts valid push payload", () => {
    const payload: PushPayload = {
      title: "New notification",
      body: "You have a new note",
      icon: "/icon.png",
      url: "/notes/123",
      type: NotificationType.NoteCreated,
      notificationId: "notif-abc",
    };
    expect(payload.title).toBe("New notification");
    expect(payload.type).toBe(NotificationType.NoteCreated);
    expect(payload.notificationId).toBe("notif-abc");
  });

  it("accepts payload without optional fields", () => {
    const payload: PushPayload = {
      title: "Alert",
      body: "Something happened",
      type: NotificationType.QuotaExceeded,
      notificationId: "notif-xyz",
    };
    expect(payload.icon).toBeUndefined();
    expect(payload.url).toBeUndefined();
  });
});

describe("NotificationCreateResult interface", () => {
  it("accepts a successful result", () => {
    const result: NotificationCreateResult = {
      id: "notif-123",
      userId: "user-123",
      type: NotificationType.NoteCreated,
      title: "New note",
      body: "A note was created",
      priority: NotificationPriority.Medium,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      channels: [NotificationChannel.Push, NotificationChannel.InApp],
    };
    expect(result.id).toBe("notif-123");
    expect(result.channels).toHaveLength(2);
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
