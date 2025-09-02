import { Router, Request, Response } from 'express';
import { YooKassaService } from '../services/yookassa.service';
import { CreatePaymentRequest, Currency, ConfirmationType, PaymentStatus } from '../types/yookassa.types';

const router = Router();
const yookassaService = new YooKassaService(process.env.YOOKASSA_SHOP_ID!, process.env.YOOKASSA_SECRET_KEY!);

// Create payment
router.post('/payments', async (req: Request, res: Response) => {
  try {
    const payload: CreatePaymentRequest = {
      amount: {
        value: req.body.amount || '100.00',
        currency: Currency.RUB,
      },
      confirmation: {
        type: ConfirmationType.Redirect,
        return_url: req.body.return_url || 'https://your-site.com/return',
      },
      capture: req.body.capture ?? true,
      description: req.body.description || 'Payment for order',
      metadata: req.body.metadata,
      // Add other fields from req.body as needed
    };
    const payment = await yookassaService.createPayment(payload);
    res.status(201).json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment status
router.get('/payments/:id', async (req: Request, res: Response) => {
  try {
    const payment = await yookassaService.getPayment(req.params.id);
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Capture payment
router.post('/payments/:id/capture', async (req: Request, res: Response) => {
  try {
    const payment = await yookassaService.capturePayment(req.params.id, req.body.amount);
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel payment
router.post('/payments/:id/cancel', async (req: Request, res: Response) => {
  try {
    const payment = await yookassaService.cancelPayment(req.params.id);
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create refund
router.post('/refunds', async (req: Request, res: Response) => {
  try {
    const payload = {
      payment_id: req.body.payment_id,
      amount: {
        value: req.body.amount || '100.00',
        currency: Currency.RUB,
      },
      description: req.body.description,
    };
    const refund = await yookassaService.createRefund(payload);
    res.status(201).json(refund);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get refund
router.get('/refunds/:id', async (req: Request, res: Response) => {
  try {
    const refund = await yookassaService.getRefund(req.params.id);
    res.json(refund);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;