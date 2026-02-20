import { ObjectId } from 'mongodb';

/**
 * Типы уведомлений в системе
 */
export enum NotificationType {
  // Уведомления об оплате
  PAYMENT_WARNING_1H = 'payment_warning_1h',           // Через 1 час после создания без оплаты
  PAYMENT_CANCELLED_2H = 'payment_cancelled_2h',       // Через 2 часа - отмена
  PAYMENT_FULL_CONFIRMED = 'payment_full_confirmed',   // Подтверждение 100% оплаты
  PAYMENT_HALF_CONFIRMED = 'payment_half_confirmed',   // Подтверждение 50% оплаты
  
  // Напоминания перед началом
  REMINDER_24H_FULL_PAID = 'reminder_24h_full_paid',   // За 24ч до начала (100% оплата)
  REMINDER_24H_HALF_PAID = 'reminder_24h_half_paid',   // За 24ч до начала (50% оплата)
}

/**
 * Статус отправки уведомления
 */
export enum NotificationStatus {
  PENDING = 'pending',         // Ожидает отправки
  SCHEDULED = 'scheduled',     // Запланировано в очереди
  PROCESSING = 'processing',   // В процессе отправки
  SENT = 'sent',              // Успешно отправлено
  FAILED = 'failed',          // Ошибка отправки
  CANCELLED = 'cancelled',    // Отменено (например, бронирование отменено)
}

/**
 * Приоритет уведомления
 */
export enum NotificationPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 20,
}

/**
 * Сущность уведомления
 */
export interface NotificationEntity {
  _id?: ObjectId;
  
  // Связь с бронированием
  bookingId: ObjectId;
  userId: ObjectId;
  
  // Тип и статус
  type: NotificationType;
  status: NotificationStatus;
  priority: NotificationPriority;
  
  // Содержимое
  phoneNumber: string;
  message: string;
  
  // Планирование
  scheduledFor: Date;          // Когда должно быть отправлено
  sentAt?: Date;               // Когда было отправлено
  
  // Повторные попытки
  attempts: number;            // Количество попыток
  maxAttempts: number;         // Максимум попыток
  lastError?: string;          // Последняя ошибка
  cancelReason?: string;       // Причина отмены
  
  // Job tracking
  jobId?: string;              // ID задачи в Bull Queue
  
  // Метаданные
  metadata?: Record<string, any>;  // Дополнительные данные для шаблона
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payload для создания уведомления
 */
export interface CreateNotificationPayload {
  bookingId: ObjectId;
  userId: ObjectId;
  type: NotificationType;
  phoneNumber: string;
  scheduledFor: Date;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
}

/**
 * Результат обработки уведомления
 */
export interface NotificationResult {
  notificationId: ObjectId;
  success: boolean;
  sentAt?: Date;
  error?: string;
  smsId?: string;  // ID из P1SMS
}
