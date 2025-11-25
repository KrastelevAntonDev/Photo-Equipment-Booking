import { ObjectId } from 'mongodb';
import { NotificationType } from '../domain/notification.entity';

/**
 * Данные бронирования для шаблонов
 */
export interface BookingTemplateData {
  bookingId: ObjectId;
  userName: string;
  roomName: string;
  equipmentNames: string[];
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
}

/**
 * Сервис для генерации текстов уведомлений
 */
export class NotificationTemplateService {
  private readonly rulesUrl = 'https://your-domain.ru/rules';
  private readonly addressUrl = 'https://your-domain.ru/address';

  /**
   * Получить текст уведомления по типу
   */
  generateMessage(type: NotificationType, data: BookingTemplateData): string {
    switch (type) {
      case NotificationType.PAYMENT_WARNING_1H:
        return this.paymentWarning1h(data);
      
      case NotificationType.PAYMENT_CANCELLED_2H:
        return this.paymentCancelled2h(data);
      
      case NotificationType.PAYMENT_FULL_CONFIRMED:
        return this.paymentFullConfirmed(data);
      
      case NotificationType.PAYMENT_HALF_CONFIRMED:
        return this.paymentHalfConfirmed(data);
      
      case NotificationType.REMINDER_24H_FULL_PAID:
        return this.reminder24hFullPaid(data);
      
      case NotificationType.REMINDER_24H_HALF_PAID:
        return this.reminder24hHalfPaid(data);
      
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }

  /**
   * Предупреждение через 1 час после создания без оплаты
   */
  private paymentWarning1h(data: BookingTemplateData): string {
    const formatted = this.formatDateTime(data.startDate);
    return (
      `Здравствуйте, ${data.userName}!\n\n` +
      `Ваша бронь на ${formatted} еще не оплачена.\n` +
      `Сумма к оплате: ${data.totalAmount} ₽\n\n` +
      `⚠️ Бронирование будет автоматически отменено через 1 час, если оплата не поступит.\n\n` +
      `Оплатите сейчас, чтобы сохранить бронирование.`
    );
  }

  /**
   * Отмена через 2 часа после создания
   */
  private paymentCancelled2h(data: BookingTemplateData): string {
    const formatted = this.formatDateTime(data.startDate);
    return (
      `Здравствуйте, ${data.userName}.\n\n` +
      `К сожалению, ваше бронирование на ${formatted} было автоматически отменено из-за отсутствия оплаты.\n\n` +
      `Если вы всё ещё хотите забронировать студию, создайте новую бронь на сайте.\n\n` +
      `Спасибо за понимание!`
    );
  }

  /**
   * Подтверждение 100% оплаты
   */
  private paymentFullConfirmed(data: BookingTemplateData): string {
    const formatted = this.formatDateTime(data.startDate);
    return (
      `✅ Бронирование подтверждено!\n\n` +
      `Здравствуйте, ${data.userName}!\n` +
      `Спасибо за оплату ${data.paidAmount} ₽\n\n` +
      `Детали бронирования:\n` +
      `📅 Дата: ${formatted}\n` +
      `📍 Зал: ${data.roomName}\n` +
      `${this.formatEquipment(data.equipmentNames)}\n` +
      `Правила студии: ${this.rulesUrl}\n\n` +
      `Ждём вас! 🎬`
    );
  }

  /**
   * Подтверждение 50% оплаты
   */
  private paymentHalfConfirmed(data: BookingTemplateData): string {
    const formatted = this.formatDateTime(data.startDate);
    return (
      `✅ Бронирование подтверждено!\n\n` +
      `Здравствуйте, ${data.userName}!\n` +
      `Внесён аванс: ${data.paidAmount} ₽\n` +
      `Осталось доплатить: ${data.remainingAmount} ₽\n\n` +
      `⚠️ ВАЖНО: Оставшуюся сумму необходимо внести до начала съёмки.\n\n` +
      `Детали бронирования:\n` +
      `📅 Дата: ${formatted}\n` +
      `📍 Зал: ${data.roomName}\n` +
      `${this.formatEquipment(data.equipmentNames)}\n` +
      `Правила студии: ${this.rulesUrl}\n\n` +
      `Ждём вас! 🎬`
    );
  }

  /**
   * Напоминание за 24 часа (100% оплата)
   */
  private reminder24hFullPaid(data: BookingTemplateData): string {
    const formatted = this.formatDateTime(data.startDate);
    return (
      `🎬 Напоминание о съёмке!\n\n` +
      `Здравствуйте, ${data.userName}!\n` +
      `Завтра у вас забронирована студия:\n\n` +
      `📅 ${formatted}\n` +
      `📍 ${data.roomName}\n` +
      `${this.formatEquipment(data.equipmentNames)}\n` +
      `Адрес и как пройти: ${this.addressUrl}\n\n` +
      `До встречи! 🎥`
    );
  }

  /**
   * Напоминание за 24 часа (50% оплата)
   */
  private reminder24hHalfPaid(data: BookingTemplateData): string {
    const formatted = this.formatDateTime(data.startDate);
    return (
      `🎬 Напоминание о съёмке!\n\n` +
      `Здравствуйте, ${data.userName}!\n` +
      `Завтра у вас забронирована студия:\n\n` +
      `📅 ${formatted}\n` +
      `📍 ${data.roomName}\n` +
      `${this.formatEquipment(data.equipmentNames)}\n` +
      `⚠️ Не забудьте доплатить ${data.remainingAmount} ₽ до начала съёмки!\n\n` +
      `Правила студии: ${this.rulesUrl}\n` +
      `Адрес: ${this.addressUrl}\n\n` +
      `До встречи! 🎥`
    );
  }

  /**
   * Форматирование даты и времени
   */
  private formatDateTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow',
    };
    return new Intl.DateTimeFormat('ru-RU', options).format(date);
  }

  /**
   * Форматирование списка оборудования
   */
  private formatEquipment(equipmentNames: string[]): string {
    if (!equipmentNames || equipmentNames.length === 0) {
      return '';
    }
    return `📦 Оборудование: ${equipmentNames.join(', ')}`;
  }
}
