import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "../NotificationService";
import type { IPushService, ShouldDeliverNowFn } from "../NotificationService";
import {
  NotificationPriority,
  NotificationType,
  NotificationChannel,
} from "../types";
import type {
  CreateNotificationInput,
  NotificationPreferences,
} from "../types";

/* ------------------------------------------------------------------ */
/*  Shared fixtures                                                    */
/* ------------------------------------------------------------------ */

const FIXED_ID = "test-notification-id";
const FIXED_DATE = new Date("2026-03-18T14:00:00Z");

function makeInput(overrides?: Partial<CreateNotificationInput>): CreateNotificationInput {
  return {
    userId: "user-1",
    type: NotificationType.NoteCreated,
    title: "New note",
    body: "A note was created",
    ...overrides,
  };
}

function makePrefs(overrides?: Partial<NotificationPreferences>): NotificationPreferences {
  return {
    userId: "user-1",
    inAppEnabled: true,
    pushEnabled: true,
    emailEnabled: false,
    typeSettings: {},
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("NotificationService", () => {
  let pushService: IPushService;
  let shouldDeliverNow: ShouldDeliverNowFn;
  let service: NotificationService;

  beforeEach(() => {
    pushService = { sendPush: vi.fn().mockResolvedValue(true) };
    shouldDeliverNow = vi.fn().mockReturnValue(true);

    service = new NotificationService({
      pushService,
      shouldDeliverNow,
      generateId: () => FIXED_ID,
      getNow: () => FIXED_DATE,
    });
  });

  /* ---------- Result structure ---------- */

  it("returns a valid NotificationCreateResult", async () => {
    const result = await service.create(makeInput(), makePrefs());

    expect(result).toEqual({
      id: FIXED_ID,
      userId: "user-1",
      type: NotificationType.NoteCreated,
      title: "New note",
      body: "A note was created",
      priority: NotificationPriority.Medium,
      createdAt: FIXED_DATE,
      channels: [NotificationChannel.Push],
    });
  });

  /* ---------- Default priority ---------- */

  it("defaults priority to Medium when not specified", async () => {
    const result = await service.create(makeInput(), makePrefs());
    expect(result.priority).toBe(NotificationPriority.Medium);
  });

  it("uses explicitly provided priority", async () => {
    const result = await service.create(
      makeInput({ priority: NotificationPriority.Urgent }),
      makePrefs(),
    );
    expect(result.priority).toBe(NotificationPriority.Urgent);
  });

  /* ---------- shouldDeliverNow integration ---------- */

  it("passes preferences, priority, and currentHour to shouldDeliverNow", async () => {
    const prefs = makePrefs({ quietHours: { start: 22, end: 7 } });
    await service.create(makeInput({ priority: NotificationPriority.High }), prefs);

    expect(shouldDeliverNow).toHaveBeenCalledWith(
      prefs,
      NotificationPriority.High,
      FIXED_DATE.getUTCHours(),
    );
  });

  it("does not send push when shouldDeliverNow returns false", async () => {
    (shouldDeliverNow as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const result = await service.create(makeInput(), makePrefs());

    expect(pushService.sendPush).not.toHaveBeenCalled();
    expect(result.channels).toEqual([]);
  });

  /* ---------- Push delivery ---------- */

  it("sends push when pushEnabled and delivery allowed", async () => {
    await service.create(makeInput(), makePrefs());

    expect(pushService.sendPush).toHaveBeenCalledWith("user-1", {
      title: "New note",
      body: "A note was created",
      type: NotificationType.NoteCreated,
      notificationId: FIXED_ID,
    });
  });

  it("does not send push when pushEnabled is false", async () => {
    const result = await service.create(
      makeInput(),
      makePrefs({ pushEnabled: false }),
    );

    expect(pushService.sendPush).not.toHaveBeenCalled();
    expect(result.channels).toEqual([]);
  });

  it("records Push channel when sendPush succeeds", async () => {
    const result = await service.create(makeInput(), makePrefs());
    expect(result.channels).toEqual([NotificationChannel.Push]);
  });

  it("does not record Push channel when sendPush fails", async () => {
    (pushService.sendPush as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const result = await service.create(makeInput(), makePrefs());
    expect(result.channels).toEqual([]);
  });

  /* ---------- ID and timestamp generation ---------- */

  it("uses injected generateId for the notification id", async () => {
    const result = await service.create(makeInput(), makePrefs());
    expect(result.id).toBe(FIXED_ID);
  });

  it("uses injected getNow for createdAt", async () => {
    const result = await service.create(makeInput(), makePrefs());
    expect(result.createdAt).toBe(FIXED_DATE);
  });

  /* ---------- Default deps (no custom generateId / getNow) ---------- */

  it("works with default generateId and getNow", async () => {
    const defaultService = new NotificationService({
      pushService,
      shouldDeliverNow,
    });

    const result = await defaultService.create(makeInput(), makePrefs());

    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("string");
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  /* ---------- Input passthrough ---------- */

  it("preserves all input fields in the result", async () => {
    const input = makeInput({
      userId: "user-42",
      type: NotificationType.QuotaExceeded,
      title: "Quota exceeded",
      body: "You reached your limit",
      priority: NotificationPriority.Urgent,
    });

    const result = await service.create(input, makePrefs({ userId: "user-42" }));

    expect(result.userId).toBe("user-42");
    expect(result.type).toBe(NotificationType.QuotaExceeded);
    expect(result.title).toBe("Quota exceeded");
    expect(result.body).toBe("You reached your limit");
  });
});
