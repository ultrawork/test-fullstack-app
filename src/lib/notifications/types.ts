/** 6 типов email-уведомлений */
export type NotificationType =
  | "welcome"
  | "password_reset"
  | "email_verification"
  | "quota_exceeded"
  | "sharing_invite"
  | "security_alert";

/** Статус записи в очереди email */
export type EmailQueueStatus = "pending" | "sent" | "failed";

/** Данные для шаблонов уведомлений */
export interface TemplateData {
  userName: string;
  [key: string]: unknown;
}

/** Запись в очереди email */
export interface EmailQueueRecord {
  id: string;
  to: string;
  subject: string;
  htmlBody: string;
  status: EmailQueueStatus;
  attempts: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Репозиторий для работы с очередью email (абстракция над Prisma) */
export interface EmailQueueRepository {
  create(data: {
    to: string;
    subject: string;
    htmlBody: string;
    status: EmailQueueStatus;
  }): Promise<EmailQueueRecord>;

  findPending(limit: number, maxAttempts: number): Promise<EmailQueueRecord[]>;

  updateStatus(
    id: string,
    status: EmailQueueStatus,
    lastError?: string | null,
  ): Promise<EmailQueueRecord>;

  incrementAttempts(id: string): Promise<EmailQueueRecord>;
}

/** Конфигурация SMTP-подключения */
export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}
