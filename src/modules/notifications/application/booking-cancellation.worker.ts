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

      console.log(`🔍 Found ${cancelledBookings.length} notifications of type PAYMENT_CANCELLED_2H to check`);

      const { BookingService } = require('@modules/bookings/application/booking.service');
      const bookingService = new BookingService();

      const now = new Date();
      let cancelledCount = 0;
      let skippedCount = 0;

      for (const notification of cancelledBookings) {
        try {
          const booking = await bookingService.getBookingById(notification.bookingId.toString());

          if (!booking) {
            console.warn(`⚠️ Booking ${notification.bookingId} not found`);
            skippedCount++;
            continue;
          }

          // Проверяем, что уведомление было отправлено и прошло 2 часа с момента отправки
          if (!notification.sentAt) {
            console.warn(`⚠️ Notification ${notification._id} has no sentAt timestamp`);
            skippedCount++;
            continue;
          }

          const hoursSinceSent = (now.getTime() - notification.sentAt.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceSent < 2) {
            // Еще не прошло 2 часа, пропускаем
            const minutesLeft = Math.ceil((2 - hoursSinceSent) * 60);
            console.log(`⏳ Booking ${notification.bookingId}: only ${hoursSinceSent.toFixed(2)} hours (${minutesLeft} min left) since notification sent, waiting...`);
            continue;
          }

          // Проверяем, что бронирование до сих пор не оплачено и не отменено
          if (booking.status === 'cancelled') {
            console.log(`ℹ️ Booking ${notification.bookingId} already cancelled - marking notification as CANCELLED`);
            // Помечаем уведомление как обработанное, так как бронирование уже отменено
            if (notification._id) {
              await this.notificationRepository.updateStatus(
                notification._id,
                NotificationStatus.CANCELLED
              );
            }
            skippedCount++;
            continue;
          }

          if (booking.paymentStatus === 'paid' || booking.isPaid) {
            console.log(`ℹ️ Booking ${notification.bookingId} already paid (paymentStatus: ${booking.paymentStatus}, isPaid: ${booking.isPaid}) - marking notification as CANCELLED`);
            // Помечаем уведомление как обработанное, так как бронирование оплачено
            if (notification._id) {
              await this.notificationRepository.updateStatus(
                notification._id,
                NotificationStatus.CANCELLED
              );
            }
            skippedCount++;
            continue;
          }

          // Проверяем paymentStatus - отменяем только если unpaid или partial (частичная оплата тоже не спасает от отмены)
          if (booking.paymentStatus && booking.paymentStatus !== 'unpaid' && booking.paymentStatus !== 'partial') {
            console.log(`ℹ️ Booking ${notification.bookingId} has unexpected paymentStatus: ${booking.paymentStatus} - marking notification as CANCELLED`);
            // Помечаем уведомление как обработанное
            if (notification._id) {
              await this.notificationRepository.updateStatus(
                notification._id,
                NotificationStatus.CANCELLED
              );
            }
            skippedCount++;
            continue;
          }

          // Отменяем бронирование
          console.log(`🔄 Cancelling booking ${notification.bookingId} (${hoursSinceSent.toFixed(2)} hours since notification)`);
          
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

          // Помечаем уведомление как обработанное (CANCELLED, так как бронирование отменено)
          if (notification._id) {
            await this.notificationRepository.updateStatus(
              notification._id,
              NotificationStatus.CANCELLED
            );
          }

          console.log(`❌ Auto-cancelled booking ${notification.bookingId} due to non-payment`);
          cancelledCount++;
        } catch (err: any) {
          console.error(`❌ Error cancelling booking ${notification.bookingId}:`, err.message);
          skippedCount++;
        }
      }

      if (cancelledCount > 0 || skippedCount > 0) {
        console.log(`📊 Cancellation summary: ${cancelledCount} cancelled, ${skippedCount} skipped`);
      }
    } catch (error: any) {
      console.error('Error in BookingCancellationWorker:', error);
    }
  }
}
