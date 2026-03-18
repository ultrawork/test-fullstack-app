import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "./EmailService";
import type {
  EmailQueueRepository,
  EmailQueueRecord,
  SmtpConfig,
  NotificationType,
  TemplateData,
} from "./types";

vi.mock("nodemailer", () => {
  const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test-id" });
  return {
    default: {
      createTransport: vi.fn().mockReturnValue({ sendMail: sendMailMock }),
    },
  };
});

import nodemailer from "nodemailer";

const smtpConfig: SmtpConfig = {
  host: "smtp.example.com",
  port: 587,
  user: "user@example.com",
  pass: "secret",
  from: "noreply@example.com",
};

function createMockRecord(
  overrides: Partial<EmailQueueRecord> = {},
): EmailQueueRecord {
  return {
    id: "rec-1",
    to: "user@test.com",
    subject: "Test Subject",
    htmlBody: "<p>Test</p>",
    status: "pending",
    attempts: 0,
    lastError: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

function createMockRepository(): EmailQueueRepository {
  return {
    create: vi.fn().mockResolvedValue(createMockRecord()),
    findPending: vi.fn().mockResolvedValue([]),
    updateStatus: vi.fn().mockResolvedValue(createMockRecord()),
    incrementAttempts: vi.fn().mockResolvedValue(createMockRecord()),
  };
}

describe("EmailService", () => {
  let service: EmailService;
  let repository: EmailQueueRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createMockRepository();
    service = new EmailService(repository, smtpConfig);
  });

  describe("constructor", () => {
    it("creates nodemailer transport with SMTP config", () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.example.com",
        port: 587,
        auth: { user: "user@example.com", pass: "secret" },
      });
    });
  });

  describe("renderTemplate", () => {
    const allTypes: NotificationType[] = [
      "welcome",
      "password_reset",
      "email_verification",
      "quota_exceeded",
      "sharing_invite",
      "security_alert",
    ];

    it.each(allTypes)("renders HTML for '%s' notification type", (type) => {
      const data: TemplateData = { userName: "Alice" };
      const html = service.renderTemplate(type, data);

      expect(html).toContain("Alice");
      expect(html).toContain("<html");
      expect(html).toContain("</html>");
    });

    it("includes base layout with header, body, footer", () => {
      const html = service.renderTemplate("welcome", { userName: "Bob" });

      expect(html).toMatch(/header/i);
      expect(html).toMatch(/footer/i);
      expect(html).toContain("Bob");
    });

    it("uses inline CSS styles", () => {
      const html = service.renderTemplate("welcome", { userName: "Eve" });

      expect(html).toContain("style=");
    });

    it("uses red accent (#dc2626) for quota_exceeded", () => {
      const html = service.renderTemplate("quota_exceeded", {
        userName: "Max",
      });

      expect(html).toContain("#dc2626");
    });

    it("renders unique headings per notification type", () => {
      const htmlWelcome = service.renderTemplate("welcome", {
        userName: "A",
      });
      const htmlReset = service.renderTemplate("password_reset", {
        userName: "A",
      });

      expect(htmlWelcome).not.toEqual(htmlReset);
    });

    it("renders password_reset with resetLink data", () => {
      const html = service.renderTemplate("password_reset", {
        userName: "Alice",
        resetLink: "https://example.com/reset/token123",
      });

      expect(html).toContain("https://example.com/reset/token123");
    });

    it("renders email_verification with verificationLink data", () => {
      const html = service.renderTemplate("email_verification", {
        userName: "Bob",
        verificationLink: "https://example.com/verify/abc",
      });

      expect(html).toContain("https://example.com/verify/abc");
    });

    it("renders sharing_invite with inviterName and resourceName", () => {
      const html = service.renderTemplate("sharing_invite", {
        userName: "Charlie",
        inviterName: "Diana",
        resourceName: "My Notes",
      });

      expect(html).toContain("Diana");
      expect(html).toContain("My Notes");
    });

    it("renders security_alert with alertMessage", () => {
      const html = service.renderTemplate("security_alert", {
        userName: "Eve",
        alertMessage: "Suspicious login detected",
      });

      expect(html).toContain("Suspicious login detected");
    });

    it("renders quota_exceeded with currentUsage and maxQuota", () => {
      const html = service.renderTemplate("quota_exceeded", {
        userName: "Frank",
        currentUsage: "95%",
        maxQuota: "1GB",
      });

      expect(html).toContain("95%");
      expect(html).toContain("1GB");
    });
  });

  describe("queueEmail", () => {
    it("creates a pending email record in the repository", async () => {
      await service.queueEmail("user@test.com", "Hello", "<p>World</p>");

      expect(repository.create).toHaveBeenCalledWith({
        to: "user@test.com",
        subject: "Hello",
        htmlBody: "<p>World</p>",
        status: "pending",
      });
    });

    it("returns the created record", async () => {
      const expected = createMockRecord({ to: "a@b.com" });
      vi.mocked(repository.create).mockResolvedValue(expected);

      const result = await service.queueEmail("a@b.com", "Sub", "<p>Hi</p>");

      expect(result).toEqual(expected);
    });
  });

  describe("sendEmail", () => {
    it("sends email via nodemailer transport", async () => {
      await service.sendEmail("user@test.com", "Subject", "<p>HTML</p>");

      const transport = vi.mocked(nodemailer.createTransport).mock.results[0]
        .value;
      expect(transport.sendMail).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: "user@test.com",
        subject: "Subject",
        html: "<p>HTML</p>",
      });
    });
  });

  describe("processQueue", () => {
    it("fetches up to 10 pending records with attempts < 3", async () => {
      await service.processQueue();

      expect(repository.findPending).toHaveBeenCalledWith(10, 3);
    });

    it("sends email and marks record as sent on success", async () => {
      const record = createMockRecord();
      vi.mocked(repository.findPending).mockResolvedValue([record]);

      await service.processQueue();

      const transport = vi.mocked(nodemailer.createTransport).mock.results[0]
        .value;
      expect(transport.sendMail).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: record.to,
        subject: record.subject,
        html: record.htmlBody,
      });
      expect(repository.updateStatus).toHaveBeenCalledWith(
        record.id,
        "sent",
        null,
      );
    });

    it("increments attempts and stores error on send failure", async () => {
      const record = createMockRecord({ attempts: 0 });
      vi.mocked(repository.findPending).mockResolvedValue([record]);

      const transport = vi.mocked(nodemailer.createTransport).mock.results[0]
        .value;
      transport.sendMail.mockRejectedValueOnce(new Error("SMTP timeout"));

      await service.processQueue();

      expect(repository.incrementAttempts).toHaveBeenCalledWith(record.id);
      expect(repository.updateStatus).toHaveBeenCalledWith(
        record.id,
        "pending",
        "SMTP timeout",
      );
    });

    it("marks record as failed after max attempts (3)", async () => {
      const record = createMockRecord({ attempts: 2 });
      vi.mocked(repository.findPending).mockResolvedValue([record]);

      const transport = vi.mocked(nodemailer.createTransport).mock.results[0]
        .value;
      transport.sendMail.mockRejectedValueOnce(new Error("Connection refused"));

      await service.processQueue();

      expect(repository.incrementAttempts).toHaveBeenCalledWith(record.id);
      expect(repository.updateStatus).toHaveBeenCalledWith(
        record.id,
        "failed",
        "Connection refused",
      );
    });

    it("processes multiple records independently", async () => {
      const records = [
        createMockRecord({ id: "rec-1" }),
        createMockRecord({ id: "rec-2" }),
        createMockRecord({ id: "rec-3" }),
      ];
      vi.mocked(repository.findPending).mockResolvedValue(records);

      await service.processQueue();

      const transport = vi.mocked(nodemailer.createTransport).mock.results[0]
        .value;
      expect(transport.sendMail).toHaveBeenCalledTimes(3);
      expect(repository.updateStatus).toHaveBeenCalledTimes(3);
    });

    it("does nothing when queue is empty", async () => {
      vi.mocked(repository.findPending).mockResolvedValue([]);

      await service.processQueue();

      const transport = vi.mocked(nodemailer.createTransport).mock.results[0]
        .value;
      expect(transport.sendMail).not.toHaveBeenCalled();
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it("continues processing remaining records if one fails", async () => {
      const records = [
        createMockRecord({ id: "rec-1" }),
        createMockRecord({ id: "rec-2" }),
      ];
      vi.mocked(repository.findPending).mockResolvedValue(records);

      const transport = vi.mocked(nodemailer.createTransport).mock.results[0]
        .value;
      transport.sendMail
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce({ messageId: "ok" });

      await service.processQueue();

      expect(repository.updateStatus).toHaveBeenCalledWith(
        "rec-1",
        "pending",
        "fail",
      );
      expect(repository.updateStatus).toHaveBeenCalledWith(
        "rec-2",
        "sent",
        null,
      );
    });
  });
});
