import { Router, Request, Response } from 'express';
import { YooKassaService } from '../services/yookassa.service';
import { WebhookNotification, WebhookEventType, Payment, Refund, PaymentStatus } from '../types/yookassa.types';
import * as net from 'net'; // For IP validation
import dotenv from 'dotenv';

const router = Router();
dotenv.config();
const yookassaService = new YooKassaService(process.env.SHOP_ID!, process.env.SECRET_KEY!);

// Known YooKassa IP ranges (update as per docs)
const YOOKASSA_IPS = [
  '185.32.248.0/22',
  '77.75.156.0/23',
  '77.75.154.128/25',
  '2a02:f480::/32',
];

function isValidYooKassaIp(ip: string): boolean {
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

router.post('/webhook', (async (req: Request, res: Response) => {
  const clientIp = req.ip || req.connection.remoteAddress || '';
  if (!isValidYooKassaIp(clientIp)) {
    console.warn(`Invalid webhook IP: ${clientIp}`);
    return res.status(403).send('Forbidden');
  }

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
        // Update order status in DB, send email, etc.
        console.log(`Payment succeeded: ${paymentSuccess.id}`);
        break;
      case WebhookEventType.PaymentCanceled:
        const paymentCancel = notification.object as Payment;
        // Handle cancellation
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