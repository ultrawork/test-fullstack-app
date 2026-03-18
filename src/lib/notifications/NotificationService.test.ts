import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  NotificationService,
  type EmailServiceInterface,
  type NotificationRepository,
  type CreateNotificationParams,
  NotificationPriority,
} from "./NotificationService";

function createMockEmailService(): EmailServiceInterface {
  return {
    renderTemplate: vi.fn().mockReturnValue("<html>rendered</html>"),
    queueEmail: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockRepository(): NotificationRepository {
  return {
    findUserById: vi.fn().mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
    }),
    findNotificationPreference: vi.fn().mockResolvedValue({
      userId: "user-1",
      emailEnabled: true,
      quietHoursStart: null,
      quietHoursEnd: null,
    }),
    createNotification: vi.fn().mockResolvedValue({
      id: "notif-1",
      userId: "user-1",
      type: "welcome",
      title: "Welcome",
      message: "Hello!",
      priority: "medium",
      isRead: false,
      emailSent: false,
      createdAt: new Date("2026-01-01T12:00:00Z"),
    }),
    updateNotification: vi.fn().mockResolvedValue(undefined),
  };
}

describe("NotificationService", () => {
  let service: NotificationService;
  let emailService: EmailServiceInterface;
  let repository: NotificationRepository;

  beforeEach(() => {
    emailService = createMockEmailService();
    repository = createMockRepository();
    service = new NotificationService(emailService, repository);
  });

  describe("create", () => {
    const params: CreateNotificationParams = {
      userId: "user-1",
      type: "welcome",
      title: "Welcome!",
      message: "Welcome to the platform",
      data: { userName: "Test User" },
    };

    it("creates a notification record in the database", async () => {
      await service.create(params);

      expect(repository.createNotification).toHaveBeenCalledWith({
        userId: "user-1",
        type: "welcome",
        title: "Welcome!",
        message: "Welcome to the platform",
        priority: "medium",
        isRead: false,
        emailSent: false,
      });
    });

    it("uses the provided priority", async () => {
      await service.create({
        ...params,
        priority: NotificationPriority.HIGH,
      });

      expect(repository.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ priority: "high" }),
      );
    });

    it("checks user notification preferences", async () => {
      await service.create(params);

      expect(repository.findNotificationPreference).toHaveBeenCalledWith(
        "user-1",
      );
    });

    it("renders email template and queues email when emailEnabled is true", async () => {
      await service.create(params);

      expect(emailService.renderTemplate).toHaveBeenCalledWith(
        "welcome",
        expect.objectContaining({ userName: "Test User" }),
      );
      expect(emailService.queueEmail).toHaveBeenCalledWith(
        "user@example.com",
        "Welcome!",
        "<html>rendered</html>",
      );
    });

    it("marks notification as emailSent after queuing", async () => {
      await service.create(params);

      expect(repository.updateNotification).toHaveBeenCalledWith("notif-1", {
        emailSent: true,
      });
    });

    it("does NOT send email when emailEnabled is false", async () => {
      vi.mocked(repository.findNotificationPreference).mockResolvedValue({
        userId: "user-1",
        emailEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
      });

      await service.create(params);

      expect(emailService.renderTemplate).not.toHaveBeenCalled();
      expect(emailService.queueEmail).not.toHaveBeenCalled();
      expect(repository.updateNotification).not.toHaveBeenCalled();
    });

    it("does NOT send email during quiet hours", async () => {
      vi.mocked(repository.findNotificationPreference).mockResolvedValue({
        userId: "user-1",
        emailEnabled: true,
        quietHoursStart: 22,
        quietHoursEnd: 8,
      });

      const now = new Date("2026-01-01T03:00:00Z");
      service = new NotificationService(emailService, repository, () => now);

      await service.create(params);

      expect(emailService.queueEmail).not.toHaveBeenCalled();
    });

    it("sends email outside quiet hours", async () => {
      vi.mocked(repository.findNotificationPreference).mockResolvedValue({
        userId: "user-1",
        emailEnabled: true,
        quietHoursStart: 22,
        quietHoursEnd: 8,
      });

      const now = new Date("2026-01-01T12:00:00Z");
      service = new NotificationService(emailService, repository, () => now);

      await service.create(params);

      expect(emailService.queueEmail).toHaveBeenCalled();
    });

    it("always sends HIGH priority emails regardless of quiet hours", async () => {
      vi.mocked(repository.findNotificationPreference).mockResolvedValue({
        userId: "user-1",
        emailEnabled: true,
        quietHoursStart: 22,
        quietHoursEnd: 8,
      });

      const now = new Date("2026-01-01T03:00:00Z");
      service = new NotificationService(emailService, repository, () => now);

      await service.create({
        ...params,
        priority: NotificationPriority.HIGH,
      });

      expect(emailService.queueEmail).toHaveBeenCalled();
    });

    it("throws error when user is not found", async () => {
      vi.mocked(repository.findUserById).mockResolvedValue(null);

      await expect(service.create(params)).rejects.toThrow(
        "User not found: user-1",
      );
    });

    it("creates notification even without preferences (defaults to emailEnabled=true)", async () => {
      vi.mocked(repository.findNotificationPreference).mockResolvedValue(null);

      await service.create(params);

      expect(repository.createNotification).toHaveBeenCalled();
      expect(emailService.queueEmail).toHaveBeenCalled();
    });

    it("returns the created notification", async () => {
      const result = await service.create(params);

      expect(result).toEqual(
        expect.objectContaining({
          id: "notif-1",
          userId: "user-1",
          type: "welcome",
        }),
      );
    });
  });

  describe("shouldDeliverNow", () => {
    it("returns true when no quiet hours are set", () => {
      const prefs = {
        userId: "user-1",
        emailEnabled: true,
        quietHoursStart: null,
        quietHoursEnd: null,
      };

      expect(service.shouldDeliverNow(prefs)).toBe(true);
    });

    it("returns false during quiet hours (overnight range)", () => {
      const prefs = {
        userId: "user-1",
        emailEnabled: true,
        quietHoursStart: 22,
        quietHoursEnd: 8,
      };

      const now = new Date("2026-01-01T02:00:00Z");
      service = new NotificationService(emailService, repository, () => now);

      expect(service.shouldDeliverNow(prefs)).toBe(false);
    });

    it("returns true outside quiet hours", () => {
      const prefs = {
        userId: "user-1",
        emailEnabled: true,
        quietHoursStart: 22,
        quietHoursEnd: 8,
      };

      const now = new Date("2026-01-01T14:00:00Z");
      service = new NotificationService(emailService, repository, () => now);

      expect(service.shouldDeliverNow(prefs)).toBe(true);
    });

    it("returns false during daytime quiet hours range", () => {
      const prefs = {
        userId: "user-1",
        emailEnabled: true,
        quietHoursStart: 9,
        quietHoursEnd: 17,
      };

      const now = new Date("2026-01-01T12:00:00Z");
      service = new NotificationService(emailService, repository, () => now);

      expect(service.shouldDeliverNow(prefs)).toBe(false);
    });

    it("returns true when emailEnabled is false (delivery check is separate)", () => {
      const prefs = {
        userId: "user-1",
        emailEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
      };

      expect(service.shouldDeliverNow(prefs)).toBe(true);
    });
  });
});
