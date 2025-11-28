import { ObjectId } from 'mongodb';
import { NotificationType } from '../domain/notification.entity';

/**
 * Данные бронирования для шаблонов
 */
export interface BookingTemplateData {
  bookingId: ObjectId | string;
  userName: string;
  roomName: string;
  equipmentNames: string[];
  startDate: Date | string; // Может быть строкой после сериализации из Redis
  endDate: Date | string;   // Может быть строкой после сериализации из Redis
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentUrl?: string;
}

/**
 * Сервис для генерации текстов уведомлений
 */
export class NotificationTemplateService {
  private readonly rulesUrl = 'https://vk.cc/cRD8Wn';
  private readonly addressUrl = 'https://vk.cc/cRD7Bi';

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
    const { date, time } = this.formatDateAndTime(data.startDate, data.endDate);
    const bookingNumber = this.getBookingNumber(data.bookingId);
    return (
      `Бронь ${bookingNumber}: ${data.roomName}\n` +
      `Дата: ${date} Время: ${time}\n` +
      `Без оплаты в течение 1 часа ваша бронь ${bookingNumber} будет снята\n` +
      `Оплата: ${data.paymentUrl || this.rulesUrl}`
    );
  }

  /**
   * Отмена через 2 часа после создания
   */
  private paymentCancelled2h(data: BookingTemplateData): string {
    const bookingNumber = this.getBookingNumber(data.bookingId);
    return `Ваша бронь ${bookingNumber} снята за отсутствием оплаты`;
  }

  /**
   * Подтверждение 100% оплаты
   */
  private paymentFullConfirmed(data: BookingTemplateData): string {
    const { date, time } = this.formatDateAndTime(data.startDate, data.endDate);
    const bookingNumber = this.getBookingNumber(data.bookingId);
    return (
      `Бронь ${bookingNumber}: ${data.roomName}\n` +
      `Дата: ${date} Время: ${time}\n` +
      `Внесено: 100% сумма ${data.paidAmount} руб.\n` +
      `Правила: ${this.rulesUrl}`
    );
  }

  /**
   * Подтверждение 50% оплаты
   */
  private paymentHalfConfirmed(data: BookingTemplateData): string {
    const { date, time } = this.formatDateAndTime(data.startDate, data.endDate);
    const bookingNumber = this.getBookingNumber(data.bookingId);
    return (
      `Бронь ${bookingNumber}: ${data.roomName}\n` +
      `Дата: ${date} Время: ${time}\n` +
      `Внесено: 50% сумма ${data.paidAmount} руб.\n` +
      `Правила: ${this.rulesUrl}`
    );
  }

  /**
   * Напоминание за 24 часа (100% оплата)
   */
  private reminder24hFullPaid(data: BookingTemplateData): string {
    const { date, time } = this.formatDateAndTime(data.startDate, data.endDate);
    const bookingNumber = this.getBookingNumber(data.bookingId);
    return (
      `Бронь ${bookingNumber}: ${data.roomName}\n` +
      `Дата: ${date} Время: ${time}\n` +
      `Внесено: 100% сумма ${data.paidAmount} руб.\n` +
      `Как доехать: ${this.addressUrl}\n` +
      `Правила: ${this.rulesUrl}`
    );
  }

  /**
   * Напоминание за 24 часа (50% оплата)
   */
  private reminder24hHalfPaid(data: BookingTemplateData): string {
    const { date, time } = this.formatDateAndTime(data.startDate, data.endDate);
    const bookingNumber = this.getBookingNumber(data.bookingId);
    return (
      `Бронь ${bookingNumber}: ${data.roomName}\n` +
      `Дата: ${date} Время: ${time}\n` +
      `Внесено: 50% сумма ${data.paidAmount} руб.\n` +
      `Как доехать: ${this.addressUrl}\n` +
      `Правила: ${this.rulesUrl}`
    );
  }

  /**
   * Форматирование даты и времени в отдельные поля
   */
  private formatDateAndTime(startDate: Date | string, endDate: Date | string): { date: string; time: string } {
    // Преобразуем строки в Date объекты, если необходимо (после сериализации из Redis)
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    // Проверяем валидность дат
    if (isNaN(start.getTime())) {
      throw new Error(`Invalid startDate: ${startDate}`);
    }
    if (isNaN(end.getTime())) {
      throw new Error(`Invalid endDate: ${endDate}`);
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Europe/Moscow',
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow',
      hour12: false,
    };
    
    const dateFormatter = new Intl.DateTimeFormat('ru-RU', dateOptions);
    const timeFormatter = new Intl.DateTimeFormat('ru-RU', timeOptions);
    
    const date = dateFormatter.format(start);
    const startTime = timeFormatter.format(start);
    const endTime = timeFormatter.format(end);
    
    return {
      date,
      time: `${startTime}-${endTime}`,
    };
  }

  /**
   * Получение номера брони из ObjectId
   */
  private getBookingNumber(bookingId: ObjectId | string): string {
    const idString = bookingId instanceof ObjectId ? bookingId.toString() : bookingId;
    return idString.slice(-4);
  }
}
