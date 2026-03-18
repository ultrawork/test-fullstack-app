/**
 * NotificationService — бизнес-логика создания уведомлений.
 *
 * Проверяет пользовательские предпочтения (emailEnabled, quiet hours),
 * создаёт запись уведомления и при необходимости ставит email в очередь
 * через EmailService.
 *
 * Зависимости (unit-1, unit-2): EmailService, типы, Prisma-модели.
 * Используется dependency injection для тестируемости.
 */

/** Типы уведомлений, поддерживаемые системой. */
export type NotificationType =
  | "welcome"
  | "password_reset"
  | "quota_exceeded"
  | "payment_success"
  | "payment_failed"
  | "account_deactivated";

/** Приоритет уведомления. */
export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

/** Данные для рендеринга email-шаблона. */
export interface TemplateData {
  userName?: string;
  [key: string]: unknown;
}

/** Интерфейс EmailService (реализуется в unit-2). */
export interface EmailServiceInterface {
  renderTemplate(type: NotificationType, data: TemplateData): string;
  queueEmail(to: string, subject: string, htmlBody: string): Promise<void>;
}

/** Пользователь (минимальный срез из Prisma User). */
export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
}

/** Настройки предпочтений уведомлений пользователя. */
export interface NotificationPreference {
  userId: string;
  emailEnabled: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
}

/** Запись уведомления в БД. */
export interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  emailSent: boolean;
  createdAt: Date;
}

/** Репозиторий для доступа к данным (абстракция над Prisma). */
export interface NotificationRepository {
  findUserById(userId: string): Promise<UserRecord | null>;
  findNotificationPreference(
    userId: string,
  ): Promise<NotificationPreference | null>;
  createNotification(
    data: Omit<NotificationRecord, "id" | "createdAt">,
  ): Promise<NotificationRecord>;
  updateNotification(
    id: string,
    data: Partial<Pick<NotificationRecord, "emailSent" | "isRead">>,
  ): Promise<void>;
}

/** Параметры для создания уведомления. */
export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  data?: TemplateData;
}

/** Функция для получения текущего времени (для тестируемости). */
type NowFn = () => Date;

export class NotificationService {
  private readonly emailService: EmailServiceInterface;
  private readonly repository: NotificationRepository;
  private readonly now: NowFn;

  constructor(
    emailService: EmailServiceInterface,
    repository: NotificationRepository,
    now: NowFn = () => new Date(),
  ) {
    this.emailService = emailService;
    this.repository = repository;
    this.now = now;
  }

  /**
   * Создаёт уведомление, проверяет предпочтения пользователя
   * и ставит email в очередь при необходимости.
   */
  async create(params: CreateNotificationParams): Promise<NotificationRecord> {
    const { userId, type, title, message, priority, data } = params;

    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const resolvedPriority = priority ?? NotificationPriority.MEDIUM;

    const notification = await this.repository.createNotification({
      userId,
      type,
      title,
      message,
      priority: resolvedPriority,
      isRead: false,
      emailSent: false,
    });

    const prefs = await this.repository.findNotificationPreference(userId);

    const emailEnabled = prefs?.emailEnabled ?? true;
    const canDeliver =
      resolvedPriority === NotificationPriority.HIGH ||
      this.shouldDeliverNow(prefs);

    if (emailEnabled && canDeliver) {
      const templateData: TemplateData = {
        userName: user.name ?? undefined,
        ...data,
      };
      const html = this.emailService.renderTemplate(type, templateData);
      await this.emailService.queueEmail(user.email, title, html);
      await this.repository.updateNotification(notification.id, {
        emailSent: true,
      });
    }

    return notification;
  }

  /**
   * Проверяет, можно ли доставить уведомление прямо сейчас
   * (вне тихих часов).
   */
  shouldDeliverNow(prefs: NotificationPreference | null): boolean {
    if (!prefs || prefs.quietHoursStart === null || prefs.quietHoursEnd === null) {
      return true;
    }

    const currentHour = this.now().getUTCHours();
    const { quietHoursStart, quietHoursEnd } = prefs;

    if (quietHoursStart < quietHoursEnd) {
      return currentHour < quietHoursStart || currentHour >= quietHoursEnd;
    }

    return currentHour >= quietHoursEnd && currentHour < quietHoursStart;
  }
}
