import { Router, Request, Response } from 'express';
import { CreatePaymentRequest, Currency, ConfirmationType } from '@infrastructure/external/yookassa/yookassa.types';
import { authMiddleware } from '@shared/middlewares/auth.middleware';
import { adminMiddleware } from '@/shared/middlewares/admin.middleware';
import { UserJwtPayload } from '@modules/users/domain/user.entity';
import { PaymentService } from '../application/payment.service';
import { createPaymentProvider } from '@modules/payments/infrastructure/provider.factory';

const router = Router();
const yookassaService = createPaymentProvider();
const paymentService = new PaymentService()
// Create payment
router.post('/payments', authMiddleware,  async (req: Request & { user?: UserJwtPayload }, res: Response) => {
  if(!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }
  if(!req.body.amount) {
     res.status(400).json({ message: 'Amount is required' });
     return
  }
  if(!req.body.bookingId) {
      res.status(400).json({ message: 'Booking ID is required' });
      return
  }
  try {
    const payload: CreatePaymentRequest = {
      amount: {
        value: req.body.amount,
        currency: Currency.RUB,
      },
      confirmation: {
        type: ConfirmationType.Redirect,
        return_url: req.body.return_url || 'http://picassostudio.ru/',
      },
      capture: req.body.capture ?? true,
      description: req.body.description || 'Payment for order',
      metadata: {
        userId: req.user.userId,
        bookingId: req.body.bookingId
      },
      receipt: {
        items: [{
          description: req.body.description || 'Payment for order',
          amount: {
            value: req.body.amount,
            currency: Currency.RUB,
          },
          quantity: 1,
          vat_code: 1,
          payment_subject: 'service',
          payment_mode: 'full_payment'
        }],
        customer: {
          email: req.user.email,
          phone: req.user.phone,
        }
      }
      // Add other fields from req.body as needed
    };
    const payment = await yookassaService.createPayment(payload);
    res.status(201).json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment status
router.get('/payments/:id', adminMiddleware,  async (req: Request, res: Response) => {
  try {
    const payment = await yookassaService.getPayment(req.params.id);
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/payments', async (req: Request, res: Response) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Capture payment
router.post('/payments/:id/capture', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const payment = await yookassaService.capturePayment(req.params.id, req.body.amount);
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel payment
router.post('/payments/:id/cancel', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const payment = await yookassaService.cancelPayment(req.params.id);
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create refund
router.post('/refunds', adminMiddleware, async (req: Request, res: Response) => {
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
router.get('/refunds/:id', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const refund = await yookassaService.getRefund(req.params.id);
    res.json(refund);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});




export default router;