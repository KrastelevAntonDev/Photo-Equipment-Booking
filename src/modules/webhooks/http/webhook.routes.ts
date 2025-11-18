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
        // Сохраняем платёж
        paymentService.createPayment({
          bookingId: new ObjectId(paymentSuccess.metadata.bookingId),
          userId: new ObjectId(paymentSuccess.metadata.userId),
          yookassaId: paymentSuccess.id,
          status: paymentSuccess.status as PaymentStatus,
          amount: Number(paymentSuccess.amount.value),
          currency: 'RUB',
          paid: paymentSuccess.paid,
          refundable: paymentSuccess.refundable,
          metadata: paymentSuccess.metadata,
          // даты от провайдера
          paidAt: paymentSuccess.captured_at ? new Date(paymentSuccess.captured_at) : (paymentSuccess.paid ? new Date(paymentSuccess.created_at) : undefined),
          createdAt: new Date(paymentSuccess.created_at),
        })
        // Регистрируем оплату в брони (накопительным итогом)
        if (paymentSuccess.paid === true) {
          await bookingService.registerPayment(paymentSuccess.metadata.bookingId, Number(paymentSuccess.amount.value));
        }
        
        // Отправка SMS уведомления пользователю
        try {
          const booking = await bookingService.getBookingById(paymentSuccess.metadata.bookingId);
          const user = await userRepository.findById(paymentSuccess.metadata.userId);
          const room = booking ? await roomRepository.findById(booking.roomId.toString()) : null;
						console.log(paymentSuccess);
          
          if (booking && user && user.phone && room) {
            // Форматируем дату и время
            const formatDate = (date: Date) => {
              const d = new Date(date);
              return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
            };
            const formatTime = (date: Date) => {
              const d = new Date(date);
              return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            };
            
            // Базовый текст SMS
            let smsText = `Оплата подтверждена! Бронь зала "${room.name}" на ${formatDate(booking.start)} с ${formatTime(booking.start)} до ${formatTime(booking.end)}. Сумма: ${paymentSuccess.amount.value} руб.`;
            
            // Получаем ссылку на чек, если есть receipt_id
            let receiptUrl: string | null = null;
						console.log(paymentSuccess);
						
            if (paymentSuccess.receipt?.id) {
              try {
                const receipt = await paymentService.getReceipt(paymentSuccess.receipt.id);
                if (receipt && receipt.status === 'succeeded') {
                  receiptUrl = buildReceiptUrl(receipt);
                  if (receiptUrl) {
                    smsText += ` Чек: ${receiptUrl}`;
                  }
                }
              } catch (receiptError: any) {
                console.warn(`Failed to get receipt for payment ${paymentSuccess.id}:`, receiptError.message);
                // Продолжаем отправку SMS без ссылки на чек
              }
            }
            
            // Если не получилось добавить чек, добавляем стандартное окончание
            if (!receiptUrl) {
              smsText += ' Ждём вас!';
            }
            
            // Проверяем формат номера (должен быть 11 цифр без +)
            let phone = user.phone.replace(/\D/g, '');
            if (phone.startsWith('8')) {
              phone = '7' + phone.substring(1);
            }
            if (phone.length === 11 && phone.startsWith('7')) {
              await smsService.send({
                sms: [{
                  phone,
                  channel: 'digit',
                  text: smsText,
                  tag: 'booking_paid',
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
        
        console.log(`Payment succeeded: ${paymentSuccess.id}`);
        break;
      case WebhookEventType.PaymentCanceled:
        const paymentCancel = notification.object as Payment;
        // Handle cancellation
        if(!paymentCancel.metadata?.bookingId || !paymentCancel.metadata?.userId) {
          console.warn('Missing metadata in payment cancel webhook');
          break;
        }
        paymentService.createPayment({
          bookingId: new ObjectId(paymentCancel.metadata.bookingId),
          userId: new ObjectId(paymentCancel.metadata.userId),
          yookassaId: paymentCancel.id,
          status: paymentCancel.status as PaymentStatus,
          amount: Number(paymentCancel.amount.value),
          currency: 'RUB',
          paid: paymentCancel.paid,
          refundable: paymentCancel.refundable,
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