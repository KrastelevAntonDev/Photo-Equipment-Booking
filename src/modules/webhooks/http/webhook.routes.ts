import { Router, Request, Response } from 'express';
import { WebhookNotification, WebhookEventType, Payment, Refund, PaymentStatus } from '../../../infrastructure/external/yookassa/yookassa.types';
import { PaymentService } from '../../payments/application/payment.service';
import * as net from 'net'; // For IP validation
import { ObjectId } from 'mongodb';
import { BookingService } from '../../bookings/application/booking.service';
import { createPaymentProvider } from '../../payments/infrastructure/provider.factory';

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
        paymentService.createPayment({
          bookingId: new ObjectId(paymentSuccess.metadata.bookingId),
          userId: new ObjectId(paymentSuccess.metadata.userId),
          yookassaId: paymentSuccess.id,
          status: paymentSuccess.status as PaymentStatus,
          amount: Number(paymentSuccess.amount.value),
          currency: 'RUB',
          paid: paymentSuccess.paid,
          refundable: paymentSuccess.refundable,
        })
        if(paymentSuccess.paid === true){
          bookingService.updateBookingStatus(paymentSuccess.metadata.bookingId, 'confirmed');
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