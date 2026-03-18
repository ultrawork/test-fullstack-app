import { describe, it, expect } from "vitest";
import { Prisma, NotificationPriority } from "@prisma/client";

describe("Prisma Schema", () => {
  describe("NotificationPriority enum", () => {
    it("should have all required priority values", () => {
      expect(NotificationPriority.low).toBe("low");
      expect(NotificationPriority.medium).toBe("medium");
      expect(NotificationPriority.high).toBe("high");
      expect(NotificationPriority.urgent).toBe("urgent");
    });

    it("should have exactly 4 values", () => {
      const values = Object.values(NotificationPriority);
      expect(values).toHaveLength(4);
    });
  });

  describe("Notification model", () => {
    it("should have all required fields in the model", () => {
      const fields = Prisma.NotificationScalarFieldEnum;
      expect(fields.id).toBe("id");
      expect(fields.userId).toBe("userId");
      expect(fields.type).toBe("type");
      expect(fields.title).toBe("title");
      expect(fields.body).toBe("body");
      expect(fields.priority).toBe("priority");
      expect(fields.channel).toBe("channel");
      expect(fields.readAt).toBe("readAt");
      expect(fields.openedAt).toBe("openedAt");
      expect(fields.createdAt).toBe("createdAt");
    });
  });

  describe("NotificationPreferences model", () => {
    it("should have all required fields in the model", () => {
      const fields = Prisma.NotificationPreferencesScalarFieldEnum;
      expect(fields.id).toBe("id");
      expect(fields.userId).toBe("userId");
      expect(fields.inAppEnabled).toBe("inAppEnabled");
      expect(fields.pushEnabled).toBe("pushEnabled");
      expect(fields.emailEnabled).toBe("emailEnabled");
      expect(fields.typeSettings).toBe("typeSettings");
      expect(fields.quietHoursStart).toBe("quietHoursStart");
      expect(fields.quietHoursEnd).toBe("quietHoursEnd");
      expect(fields.createdAt).toBe("createdAt");
      expect(fields.updatedAt).toBe("updatedAt");
    });
  });
});
