import { Router, Request, Response } from 'express';
import { CreatePaymentRequest, Currency, ConfirmationType, PaymentMethodType } from '@infrastructure/external/yookassa/yookassa.types';
import { authMiddleware } from '@shared/middlewares/auth.middleware';
import { requireAdminLevel } from '@/shared/middlewares/admin.middleware';
import { UserJwtPayload } from '@modules/users/domain/user.entity';
import { PaymentService } from '../application/payment.service';
import { BookingService } from '@modules/bookings/application/booking.service';
import { createPaymentProvider } from '@modules/payments/infrastructure/provider.factory';

const router = Router();
const yookassaService = createPaymentProvider();
const paymentService = new PaymentService()
const bookingService = new BookingService()
// Create payment
router.post('/payments', authMiddleware,  async (req: Request & { user?: UserJwtPayload }, res: Response) => {
  if(!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }
  if(!req.body.bookingId) {
      res.status(400).json({ message: 'Booking ID is required' });
      return
  }
  try {
    const method = (req.body.method as string | undefined) || 'online';
    const paymentOption = (req.body.paymentOption as string | undefined) || 'full'; // 'full' | 'half'

    // Обработка оплаты на месте: не создаём плтёж в YooKassa
    if (method === 'on_site_cash' || method === 'on_site_card') {
      const updated = await bookingService.setOnSitePayment(req.body.bookingId, method);
      if (!updated) {
        res.status(404).json({ message: 'Booking not found' });
        return;
      }
      res.status(201).json({
        status: 'on_site_selected',
        method,
        booking: updated,
      });
      return;
    }

    // Рассчитываем сумму из брони
    const booking = await bookingService.getBookingById(req.body.bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    const total = booking.totalPrice ?? 0;
    const alreadyPaid = booking.paidAmount ?? 0;
    const outstanding = Math.max(0, total - alreadyPaid);
    if (outstanding <= 0) {
      res.status(400).json({ message: 'Booking already fully paid' });
      return;
    }
    const desired = paymentOption === 'half' ? total * 0.5 : total;
    const amountToPay = Math.min(outstanding, desired);
    const amountValue = amountToPay.toFixed(2);

    const payload: CreatePaymentRequest = {
      amount: {
        value: amountValue,
        currency: Currency.RUB,
      },
      payment_method_data: {
        type: PaymentMethodType.Sbp
      },

      confirmation: {
        type: ConfirmationType.Redirect,
        return_url: req.body.return_url || 'http://picassostudio.ru/',
      },
      capture: req.body.capture ?? true,
      description: req.body.description || 'Payment for booking',
      metadata: {
        userId: req.user.userId,
        bookingId: req.body.bookingId,
        paymentOption,
      },
      receipt: {
        items: [{
          description: req.body.description || 'Payment for booking',
          amount: {
            value: amountValue,
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
router.get('/payments/:id', requireAdminLevel('full'),  async (req: Request, res: Response) => {
  try {
    const payment = await yookassaService.getPayment(req.params.id);
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/payments', requireAdminLevel('full'), async (req: Request, res: Response) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Capture payment
router.post('/payments/:id/capture', requireAdminLevel('full'), async (req: Request, res: Response) => {
  try {
    const payment = await yookassaService.capturePayment(req.params.id, req.body.amount);
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel payment
router.post('/payments/:id/cancel', requireAdminLevel('full'), async (req: Request, res: Response) => {
  try {
    const payment = await yookassaService.cancelPayment(req.params.id);
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create refund
router.post('/refunds', requireAdminLevel('full'), async (req: Request, res: Response) => {
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
router.get('/refunds/:id', requireAdminLevel('full'), async (req: Request, res: Response) => {
  try {
    const refund = await yookassaService.getRefund(req.params.id);
    res.json(refund);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get receipt by ID
router.get('/receipts/:receiptId', requireAdminLevel('full'), async (req: Request, res: Response) => {
  try {
    const receiptId = req.params.receiptId;
    if (!receiptId) {
      res.status(400).json({ error: 'Receipt ID is required' });
      return;
    }
    const receipt = await paymentService.getReceipt(receiptId);
    res.json(receipt);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;