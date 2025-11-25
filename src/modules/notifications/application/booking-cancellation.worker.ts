import { ObjectId } from 'mongodb';
import { NotificationRepository } from '../domain/notification.repository';
import { NotificationStatus, NotificationType } from '../domain/notification.entity';

/**
 * Worker для автоматической отмены неоплаченных бронирований
 */
export class BookingCancellationWorker {
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor(
    private notificationRepository: NotificationRepository,
    private checkIntervalMs: number = 60000 // Проверка каждую минуту
  ) {}

  /**
   * Запустить worker
   */
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ BookingCancellationWorker already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting BookingCancellationWorker...');

    // Запускаем первую проверку сразу
    this.checkAndCancelBookings();

    // Затем запускаем периодически
    this.intervalId = setInterval(() => {
      this.checkAndCancelBookings();
    }, this.checkIntervalMs);
  }

  /**
   * Остановить worker
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    console.log('✅ BookingCancellationWorker stopped');
  }

  /**
   * Проверить и отменить бронирования
   */
  private async checkAndCancelBookings(): Promise<void> {
    try {
      // Находим все уведомления типа PAYMENT_CANCELLED_2H, которые были отправлены
      const cancelNotifications = await this.notificationRepository.findByStatus(
        NotificationStatus.SENT
      );

      const cancelledBookings = cancelNotifications.filter(
        (n) => n.type === NotificationType.PAYMENT_CANCELLED_2H
      );

      if (cancelledBookings.length === 0) {
        return;
      }

      console.log(`🔍 Found ${cancelledBookings.length} bookings to potentially cancel`);

      const { BookingService } = require('@modules/bookings/application/booking.service');
      const bookingService = new BookingService();

      for (const notification of cancelledBookings) {
        try {
          const booking = await bookingService.getBookingById(notification.bookingId.toString());

          if (!booking) {
            console.warn(`Booking ${notification.bookingId} not found`);
            continue;
          }

          // Проверяем, что бронирование до сих пор не оплачено
          if (booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled') {
            // Отменяем бронирование
            await bookingService.updateBookingStatus(
              notification.bookingId.toString(),
              'cancelled'
            );

            // Обновляем запись бронирования с информацией об отмене
            const { getDB } = require('@config/database');
            const db = getDB();
            await db.collection('bookings').updateOne(
              { _id: new ObjectId(notification.bookingId) },
              {
                $set: {
                  cancelledAt: new Date(),
                  cancellationReason: 'Автоматическая отмена: оплата не поступила в течение 2 часов',
                  updatedAt: new Date(),
                },
              }
            );

            console.log(`❌ Auto-cancelled booking ${notification.bookingId} due to non-payment`);
          }
        } catch (err: any) {
          console.error(`Error cancelling booking ${notification.bookingId}:`, err.message);
        }
      }
    } catch (error: any) {
      console.error('Error in BookingCancellationWorker:', error);
    }
  }
}
