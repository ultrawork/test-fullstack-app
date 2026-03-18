import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type {
  NotificationType,
  TemplateData,
  EmailQueueRecord,
  EmailQueueRepository,
  SmtpConfig,
} from "./types";

/** Максимальное число попыток отправки */
const MAX_ATTEMPTS = 3;

/** Размер батча при обработке очереди */
const BATCH_SIZE = 10;

/** Конфигурация шаблона: заголовок и цвет акцента */
interface TemplateConfig {
  title: string;
  accentColor: string;
}

const TEMPLATE_CONFIGS: Record<NotificationType, TemplateConfig> = {
  welcome: { title: "Добро пожаловать!", accentColor: "#16a34a" },
  password_reset: { title: "Сброс пароля", accentColor: "#2563eb" },
  email_verification: {
    title: "Подтверждение email",
    accentColor: "#2563eb",
  },
  quota_exceeded: { title: "Квота превышена", accentColor: "#dc2626" },
  sharing_invite: {
    title: "Приглашение к совместной работе",
    accentColor: "#9333ea",
  },
  security_alert: {
    title: "Предупреждение безопасности",
    accentColor: "#ea580c",
  },
};

/** Сервис для отправки email-уведомлений */
export class EmailService {
  private readonly transporter: Transporter;
  private readonly repository: EmailQueueRepository;
  private readonly fromAddress: string;

  constructor(repository: EmailQueueRepository, smtpConfig: SmtpConfig) {
    this.repository = repository;
    this.fromAddress = smtpConfig.from;
    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    });
  }

  /** Рендерит HTML-шаблон для указанного типа уведомления */
  renderTemplate(type: NotificationType, data: TemplateData): string {
    const config = TEMPLATE_CONFIGS[type];
    const body = this.renderBody(type, data);

    return this.wrapLayout(config.title, config.accentColor, body);
  }

  /** Добавляет email в очередь на отправку */
  async queueEmail(
    to: string,
    subject: string,
    htmlBody: string,
  ): Promise<EmailQueueRecord> {
    return this.repository.create({
      to,
      subject,
      htmlBody,
      status: "pending",
    });
  }

  /** Отправляет email напрямую через SMTP */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject,
      html,
    });
  }

  /** Обрабатывает очередь: отправляет до 10 pending записей */
  async processQueue(): Promise<void> {
    const records = await this.repository.findPending(BATCH_SIZE, MAX_ATTEMPTS);

    for (const record of records) {
      try {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to: record.to,
          subject: record.subject,
          html: record.htmlBody,
        });
        await this.repository.updateStatus(record.id, "sent", null);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        await this.repository.incrementAttempts(record.id);

        const newStatus =
          record.attempts + 1 >= MAX_ATTEMPTS ? "failed" : "pending";
        await this.repository.updateStatus(record.id, newStatus, message);
      }
    }
  }

  private renderBody(type: NotificationType, data: TemplateData): string {
    switch (type) {
      case "welcome":
        return `
          <p style="margin: 0 0 16px; color: #374151;">Здравствуйте, ${this.escapeHtml(data.userName)}!</p>
          <p style="margin: 0 0 16px; color: #374151;">Добро пожаловать в Notes App. Мы рады видеть вас среди наших пользователей.</p>`;

      case "password_reset":
        return `
          <p style="margin: 0 0 16px; color: #374151;">Здравствуйте, ${this.escapeHtml(data.userName)}!</p>
          <p style="margin: 0 0 16px; color: #374151;">Вы запросили сброс пароля. Перейдите по ссылке ниже:</p>
          <p style="margin: 0 0 16px;"><a href="${this.escapeHtml(String(data.resetLink ?? "#"))}" style="color: #2563eb; text-decoration: underline;">${this.escapeHtml(String(data.resetLink ?? "#"))}</a></p>`;

      case "email_verification":
        return `
          <p style="margin: 0 0 16px; color: #374151;">Здравствуйте, ${this.escapeHtml(data.userName)}!</p>
          <p style="margin: 0 0 16px; color: #374151;">Подтвердите ваш email, перейдя по ссылке:</p>
          <p style="margin: 0 0 16px;"><a href="${this.escapeHtml(String(data.verificationLink ?? "#"))}" style="color: #2563eb; text-decoration: underline;">${this.escapeHtml(String(data.verificationLink ?? "#"))}</a></p>`;

      case "quota_exceeded":
        return `
          <p style="margin: 0 0 16px; color: #374151;">Здравствуйте, ${this.escapeHtml(data.userName)}!</p>
          <p style="margin: 0 0 16px; color: #dc2626; font-weight: bold;">Ваша квота превышена.</p>
          <p style="margin: 0 0 16px; color: #374151;">Текущее использование: ${this.escapeHtml(String(data.currentUsage ?? "N/A"))} из ${this.escapeHtml(String(data.maxQuota ?? "N/A"))}.</p>`;

      case "sharing_invite":
        return `
          <p style="margin: 0 0 16px; color: #374151;">Здравствуйте, ${this.escapeHtml(data.userName)}!</p>
          <p style="margin: 0 0 16px; color: #374151;">${this.escapeHtml(String(data.inviterName ?? ""))} приглашает вас к совместной работе над «${this.escapeHtml(String(data.resourceName ?? ""))}».</p>`;

      case "security_alert":
        return `
          <p style="margin: 0 0 16px; color: #374151;">Здравствуйте, ${this.escapeHtml(data.userName)}!</p>
          <p style="margin: 0 0 16px; color: #ea580c; font-weight: bold;">${this.escapeHtml(String(data.alertMessage ?? "Обнаружена подозрительная активность"))}</p>`;
    }
  }

  private wrapLayout(title: string, accentColor: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 24px 0;" align="center">
      <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
        <!-- header -->
        <tr><td style="padding: 24px 32px; background-color: ${accentColor};">
          <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">${this.escapeHtml(title)}</h1>
        </td></tr>
        <!-- body -->
        <tr><td style="padding: 32px;">
          ${body}
        </td></tr>
        <!-- footer -->
        <tr><td style="padding: 16px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">Notes App &copy; ${new Date().getFullYear()}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
