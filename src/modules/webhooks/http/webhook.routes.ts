import { Router, Request, Response } from 'express';
import { WebhookNotification, WebhookEventType, Payment, Refund, PaymentStatus } from '@infrastructure/external/yookassa/yookassa.types';
import { PaymentService } from '@modules/payments/application/payment.service';
import * as net from 'net'; // For IP validation
import { ObjectId } from 'mongodb';
import { BookingService } from '@modules/bookings/application/booking.service';
import { createPaymentProvider } from '@modules/payments/infrastructure/provider.factory';
import { SmsService } from '@modules/sms/application/sms.service';
import { UserMongoRepository } from '@modules/users/infrastructure/user.mongo.repository';
import { RoomMongoRepository } from '@modules/rooms/infrastructure/room.mongo.repository';
import { buildReceiptUrl } from '@shared/utils/receipt.utils';
import { PaymentCurrency } from '@/modules/payments/domain/payment.entity';
import { normalizePhone } from '@shared/utils/phone.utils';

const router = Router();
const yookassaService = createPaymentProvider();

// Known YooKassa IP ranges (update as per docs)
const _YOOKASSA_IPS = [
  '185.32.248.0/22',
  '77.75.156.0/23',
  '77.75.154.128/25',
  '2a02:f480::/32',
];

function _isValidYooKassaIp(ip: string): boolean {
  // Simple check; for production, use a library like ip-range-check
  if (net.isIPv6(ip)) {
    return ip.startsWith('2a02:f480:');
  }
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      (a === 185 && b === 32 && ip >= '185.32.248.0' && ip <= '185.32.251.255') ||
      (a === 77 && b === 75 && ((ip >= '77.75.156.0' && ip <= '77.75.157.255') || (ip >= '77.75.154.128' && ip <= '77.75.154.255')))
    );
  }
  return false;
}

const paymentService = new PaymentService();
const bookingService = new BookingService();
const smsService = new SmsService();
const userRepository = new UserMongoRepository();
const roomRepository = new RoomMongoRepository();

router.post('/webhook', (async (req: Request, res: Response) => {
  // const clientIp = req.ip || req.connection.remoteAddress || '';
  // if (!isValidYooKassaIp(clientIp)) {
  //   console.warn(`Invalid webhook IP: ${clientIp}`);
  //   return res.status(403).send('Forbidden');
  // }

  const notification: WebhookNotification = req.body;
  console.log(req.body);
  
  if (notification.type !== 'notification') {
    return res.status(400).send('Invalid notification type');
  }

  try {
    switch (notification.event) {
      case WebhookEventType.PaymentWaitingForCapture:
        const paymentWait = notification.object as Payment;
        // Example: auto-capture if conditions met
        if (paymentWait.status === PaymentStatus.WaitingForCapture) {
          await yookassaService.capturePayment(paymentWait.id);
        }
        break;
      case WebhookEventType.PaymentSucceeded:
        const paymentSuccess = notification.object as Payment;
        if(!paymentSuccess.metadata?.bookingId || !paymentSuccess.metadata?.userId) {
          console.warn('Missing metadata in payment success webhook');
          break;
        }

        // Получаем информацию о бронировании для промокода
        const bookingForPromo = await bookingService.getBookingById(paymentSuccess.metadata.bookingId);

        // Проверяем, есть ли административная скидка в metadata
        const hasAdminDiscount = paymentSuccess.metadata?.adminDiscount;
        let finalOriginalAmount = bookingForPromo?.originalPrice;
        let finalDiscount = bookingForPromo?.discount;

        if (hasAdminDiscount) {
          const adminDiscount = Number(paymentSuccess.metadata.adminDiscount);
          const originalAmount = Number(paymentSuccess.metadata.originalAmount);
          
          // Если была скидка от промокода, суммируем её с административной
          if (bookingForPromo?.discount) {
            finalDiscount = bookingForPromo.discount + adminDiscount;
          } else {
            finalDiscount = adminDiscount;
            finalOriginalAmount = originalAmount + adminDiscount;
          }
        }

				const paymentData = {
					bookingId: new ObjectId(paymentSuccess.metadata.bookingId),
          userId: new ObjectId(paymentSuccess.metadata.userId),
          yookassaId: paymentSuccess.id,
          status: paymentSuccess.status as PaymentStatus,
          amount: Number(paymentSuccess.amount.value),
          originalAmount: finalOriginalAmount,
          discount: finalDiscount,
          promocode: bookingForPromo?.promocode,
          promocodeId: bookingForPromo?.promocodeId,
          currency: PaymentCurrency.RUB,
          paid: paymentSuccess.paid,
          refundable: paymentSuccess.refundable,
          metadata: paymentSuccess.metadata,
          // даты от провайдера
          paidAt: paymentSuccess.captured_at ? new Date(paymentSuccess.captured_at) : (paymentSuccess.paid ? new Date(paymentSuccess.created_at) : undefined),
          createdAt: new Date(paymentSuccess.created_at),
				}
        // Сохраняем платёж
        await paymentService.createPayment(paymentData);
        // Регистрируем оплату в брони (накопительным итогом)
        // Регистрируем оплату независимо от флага paid (некоторые методы могут задерживать его выставление)
        try {
          const bookingAfterPay = await bookingService.registerPayment(paymentSuccess.metadata.bookingId, Number(paymentSuccess.amount.value));
          console.log('[webhook] booking payment registered:', {
            bookingId: paymentSuccess.metadata.bookingId,
            paidAmount: bookingAfterPay?.paidAmount,
            paymentStatus: bookingAfterPay?.paymentStatus,
            isPaid: bookingAfterPay?.isPaid,
            status: bookingAfterPay?.status,
          });
        } catch (regErr: any) {
          console.error('[webhook] failed to register payment in booking:', regErr.message);
        }

        // === НОВАЯ СИСТЕМА УВЕДОМЛЕНИЙ ===
        // Отправляем подтверждение оплаты через NotificationService
        let notificationScheduled = false;
        try {
          const NotificationModule = require('@modules/notifications').default;
          const { BookingNotificationScheduler } = require('@modules/bookings/application/booking-notification.scheduler');
          
          const notificationModule = NotificationModule.getInstance();
          const notificationService = notificationModule.getService();
          const scheduler = new BookingNotificationScheduler(notificationService);

          const booking = await bookingService.getBookingById(paymentSuccess.metadata.bookingId);
          if (booking) {
            const room = await roomRepository.findById(booking.roomId.toString());
            const equipmentNames: string[] = [];
            if (booking.equipmentIds && booking.equipmentIds.length > 0) {
              const { EquipmentMongoRepository } = require('@modules/equipment/infrastructure/equipment.mongo.repository');
              const equipmentRepo = new EquipmentMongoRepository();
              for (const eqId of booking.equipmentIds) {
                const eq = await equipmentRepo.findById(eqId.toString());
                if (eq) equipmentNames.push(eq.name);
              }
            }

            const templateData = require('@modules/bookings/application/booking-notification.scheduler')
              .BookingNotificationScheduler.createTemplateData(booking, room?.name || 'Зал', equipmentNames);

            // Отправляем подтверждение оплаты
            await scheduler.sendPaymentConfirmation(booking, templateData);
            notificationScheduled = true;
            console.log(`✅ Payment confirmation notification scheduled for booking ${booking._id}`);
          }
        } catch (notifErr: any) {
          console.error('⚠️ Failed to send notification via NotificationService:', notifErr.message);
          // Fallback на старую систему SMS
        }
        
        // Отправка SMS уведомления пользователю (LEGACY - только если новая система не сработала)
        if (!notificationScheduled) { try {
					console.log('Sending SMS notification for payment:', paymentSuccess.id);
					
					console.log('booking id:', paymentSuccess.metadata.bookingId);
          const booking = await bookingService.getBookingById(paymentSuccess.metadata.bookingId);
					console.log('user id:', paymentSuccess.metadata.userId);
          const user = await userRepository.findById(paymentSuccess.metadata.userId);
          const room = booking ? await roomRepository.findById(booking.roomId.toString()) : null;
          
          if (booking && user && user.phone && room) {
						console.log('found booking, user, and room for SMS notification');
						
            // Форматируем дату и время (фиксируем часовой пояс на Europe/Moscow)
            const formatDate = (date: Date) => {
              const d = new Date(date);
              return new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'Europe/Moscow',
              }).format(d);
            };
            const formatTime = (date: Date) => {
              const d = new Date(date);
              return new Intl.DateTimeFormat('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Europe/Moscow',
              }).format(d);
            };
            
            // Получаем ссылку на чек, если есть receipt_id
            let receiptUrl: string | null = null;
            let link: string | undefined = undefined;
						console.log(paymentSuccess);
						
            if (paymentSuccess.receipt?.id) {
							console.log('Receipt ID:', paymentSuccess.receipt.id);
              try {
                // Ждём 30 секунд, чтобы чек успел сформироваться в ОФД
                console.log('Waiting 30 seconds for receipt to be processed...');
                await new Promise(resolve => setTimeout(resolve, 30000));
                
                const receipt = await paymentService.getReceipt(paymentSuccess.receipt.id);
                if (receipt && receipt.status === 'succeeded') {
                  receiptUrl = buildReceiptUrl(receipt);
                  if (receiptUrl) {
                    link = receiptUrl; // Будет использоваться с #shorturl#
                  }
                }
              } catch (receiptError: any) {
                console.warn(`Failed to get receipt for payment ${paymentSuccess.id}:`, receiptError.message);
                // Продолжаем отправку SMS без ссылки на чек
              }
            } else {
							console.log('No receipt ID available for payment:', paymentSuccess.id);
						}
            
            // Формируем текст SMS с использованием шаблона P1SMS
            // Шаблон: Оплата подтверждена! Бронь зала "%w" на %d с %d до %d. Сумма: %d руб. Чек: #shorturl#
            let smsText: string;
            if (receiptUrl) {
              // С чеком - используем #shorturl# для автоматического сокращения ссылки
              smsText = `Оплата подтверждена! Бронь зала "${room.name}" на ${formatDate(booking.start)} с ${formatTime(booking.start)} до ${formatTime(booking.end)}. Сумма: ${paymentSuccess.amount.value} руб. Чек: ${receiptUrl}`;
            } else {
              // Без чека
              smsText = `Оплата подтверждена! Бронь зала "${room.name}" на ${formatDate(booking.start)} с ${formatTime(booking.start)} до ${formatTime(booking.end)}. Сумма: ${paymentSuccess.amount.value} руб. Ждём вас!`;
            }
            
            // Нормализуем номер телефона
            const normalizedPhone = normalizePhone(user.phone);
            // Для SMS нужен номер без + (11 цифр)
            let phone = normalizedPhone.replace(/[^\d]/g, '');
            if (phone.startsWith('8')) {
              phone = '7' + phone.substring(1);
            }
            if (phone.length === 11 && phone.startsWith('7')) {
							console.log('Sending SMS to phone:', phone);
              await smsService.send({
                sms: [{
                  phone,
                  channel: 'char',
                  text: smsText,
                  tag: 'booking_paid',
                  link: link, // Ссылка для замены #shorturl#
                }]
              });
              console.log(`SMS sent to ${phone} for booking ${booking._id}${receiptUrl ? ' with receipt link' : ''}`);
            } else {
              console.warn(`Invalid phone format for user ${user._id}: ${user.phone}`);
            }
          }
					else{
						console.warn('Missing booking, user, or room data for SMS notification');
					}
        } catch (smsError: any) {
          console.error('Failed to send SMS notification:', smsError.message);
          // Не прерываем обработку webhook, если SMS не отправилась
        }
        }
        
        console.log(`Payment succeeded: ${paymentSuccess.id}`);
        break;
      case WebhookEventType.PaymentCanceled:
        const paymentCancel = notification.object as Payment;
        // Handle cancellation
        if(!paymentCancel.metadata?.bookingId || !paymentCancel.metadata?.userId) {
          console.warn('Missing metadata in payment cancel webhook');
          break;
        }
        await paymentService.createPayment({
          bookingId: new ObjectId(paymentCancel.metadata.bookingId),
          userId: new ObjectId(paymentCancel.metadata.userId),
          yookassaId: paymentCancel.id,
          status: paymentCancel.status as PaymentStatus,
          amount: Number(paymentCancel.amount.value),
          currency: PaymentCurrency.RUB,
          paid: paymentCancel.paid,
          refundable: paymentCancel.refundable,
          metadata: paymentCancel.metadata,
          createdAt: new Date(paymentCancel.created_at),
        })
        console.log(`Payment canceled: ${paymentCancel.id}`);
        break;
      case WebhookEventType.RefundSucceeded:
        const refund = notification.object as Refund;
        // Update refund status
        
        console.log(`Refund succeeded: ${refund.id}`);
        break;
      default:
        console.warn(`Unhandled event: ${notification.event}`);
    }
    res.status(200).send('OK');
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    res.status(500).send('Internal Server Error');
  }
}) as import('express').RequestHandler);

export default router;