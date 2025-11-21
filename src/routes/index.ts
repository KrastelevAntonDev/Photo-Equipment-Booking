import { Router } from 'express';

// Feature module routes
import authRoutes from '@modules/auth/http/auth.routes';
import bookingRoutes from '@modules/bookings/http/booking.routes';
import equipmentRoutes from '@modules/equipment/http/equipment.routes';
import formRoutes from '@modules/forms/http/form.routes';
import paymentRoutes from '@modules/payments/http/payment.routes';
import promocodeRoutes from '@modules/promocodes/http/promocode.routes';
import roomRoutes from '@modules/rooms/http/room.routes';
import subscriptionRoutes from '@modules/subscriptions/http/subscription.routes';
import userRoutes from '@modules/users/http/user.routes';
import ymlRoutes from '@modules/feeds/http/yml.routes';
import smsRoutes from '@modules/sms/http/sms.routes';
import uploadRoutes from '@modules/uploads/http/upload.routes';

const router = Router();

// Mount feature routers (used under /api in app.ts)
router.use(authRoutes);
router.use(bookingRoutes);
router.use(equipmentRoutes);
router.use(formRoutes);
router.use(paymentRoutes);
router.use(promocodeRoutes);
router.use(roomRoutes);
router.use(subscriptionRoutes);
router.use(userRoutes);
router.use(ymlRoutes);
router.use(smsRoutes);
router.use(uploadRoutes);

export default router;
