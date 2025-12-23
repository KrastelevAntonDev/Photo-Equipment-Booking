import { ObjectId } from 'mongodb';
import { Booking } from '../domain/booking.entity';
import { NotificationService } from '../../notifications/application/notification.service';
import { NotificationType } from '../../notifications/domain/notification.entity';
import { BookingTemplateData } from '../../notifications/application/notification-template.service';

/**
 * Сервис для планирования уведомлений при создании/обновлении бронирования
 */
export class BookingNotificationScheduler {
  constructor(private notificationService: NotificationService) {}

  /**
   * Запланировать все уведомления для нового бронирования
   */
  async scheduleNotificationsForNewBooking(
    booking: Booking,
    templateData: BookingTemplateData
  ): Promise<void> {
    if (!booking._id || !booking.user?.phone) {
      console.warn('Cannot schedule notifications: missing booking ID or phone');
      return;
    }

    const phoneNumber = booking.user.phone;
    const bookingId = booking._id;
    const userId = booking.userId;

    // 1. Предупреждение через 1 час (если не оплачено)
    if (booking.paymentStatus === 'unpaid') {
      const warning1h = new Date(booking.createdAt.getTime() + 60 * 60 * 1000); // +1 час
      await this.notificationService.scheduleNotification(
        {
          bookingId,
          userId,
          type: NotificationType.PAYMENT_WARNING_1H,
          phoneNumber,
          scheduledFor: warning1h,
        },
        templateData
      );
    }

    // 2. Отмена через 2 часа (если не оплачено)
    if (booking.paymentStatus === 'unpaid') {
      const cancel2h = new Date(booking.createdAt.getTime() + 2 * 60 * 60 * 1000); // +2 часа
      await this.notificationService.scheduleNotification(
        {
          bookingId,
          userId,
          type: NotificationType.PAYMENT_CANCELLED_2H,
          phoneNumber,
          scheduledFor: cancel2h,
        },
        templateData
      );
    }

    // 3. Напоминание за 24 часа до начала
    const reminder24h = new Date(booking.start.getTime() - 24 * 60 * 60 * 1000); // -24 часа
    if (reminder24h > new Date()) {
      // Только если время еще не прошло
      const reminderType =
        booking.paymentStatus === 'paid'
          ? NotificationType.REMINDER_24H_FULL_PAID
          : NotificationType.REMINDER_24H_HALF_PAID;

      await this.notificationService.scheduleNotification(
        {
          bookingId,
          userId,
          type: reminderType,
          phoneNumber,
          scheduledFor: reminder24h,
        },
        templateData
      );
    }
  }

  /**
   * Отправить немедленное подтверждение оплаты
   */
  async sendPaymentConfirmation(
    booking: Booking,
    templateData: BookingTemplateData
  ): Promise<void> {
    if (!booking._id || !booking.user?.phone) {
      console.warn('Cannot send payment confirmation: missing booking ID or phone');
      return;
    }

    const phoneNumber = booking.user.phone;
    const bookingId = booking._id;
    const userId = booking.userId;

    // Определяем тип уведомления по статусу оплаты
    const notificationType =
      booking.paymentStatus === 'paid'
        ? NotificationType.PAYMENT_FULL_CONFIRMED
        : NotificationType.PAYMENT_HALF_CONFIRMED;

    // Отправляем сразу (scheduledFor = now)
    await this.notificationService.scheduleNotification(
      {
        bookingId,
        userId,
        type: notificationType,
        phoneNumber,
        scheduledFor: new Date(),
      },
      templateData
    );

    // Отменяем предупреждающие уведомления о неоплате
    await this.notificationService.cancelNotifications(bookingId);

    // Планируем напоминание за 24 часа (если еще не запланировано)
    const reminder24h = new Date(booking.start.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > new Date()) {
      const reminderType =
        booking.paymentStatus === 'paid'
          ? NotificationType.REMINDER_24H_FULL_PAID
          : NotificationType.REMINDER_24H_HALF_PAID;

      await this.notificationService.scheduleNotification(
        {
          bookingId,
          userId,
          type: reminderType,
          phoneNumber,
          scheduledFor: reminder24h,
        },
        templateData
      );
    }
  }

  /**
   * Отменить все уведомления для бронирования
   */
  async cancelAllNotifications(bookingId: ObjectId): Promise<void> {
    await this.notificationService.cancelNotifications(bookingId);
  }

  /**
   * Создать template data из бронирования
   */
  static createTemplateData(
    booking: Booking,
    roomName: string,
    equipmentNames: string[]
  ): BookingTemplateData {
    return {
      bookingId: booking._id!,
      userName: booking.user?.fullName || booking.user?.email || 'Гость',
      roomName,
      equipmentNames,
      startDate: booking.start,
      endDate: booking.end,
      totalAmount: booking.totalPrice,
      paidAmount: booking.paidAmount || 0,
      remainingAmount: booking.totalPrice - (booking.paidAmount || 0),
      paymentStatus: booking.paymentStatus || 'unpaid',
			paymentUrl: booking.paymentUrl,
    };
  }
}
