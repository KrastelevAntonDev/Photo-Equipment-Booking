import { Router } from 'express';

// Feature module routes
import authRoutes from '@modules/auth/http/auth.routes';
import bookingRoutes from '@modules/bookings/http/booking.routes';
import equipmentRoutes from '@modules/equipment/http/equipment.routes';
import formRoutes from '@modules/forms/http/form.routes';
import paymentRoutes from '@modules/payments/http/payment.routes';
import roomRoutes from '@modules/rooms/http/room.routes';
import subscriptionRoutes from '@modules/subscriptions/http/subscription.routes';
import userRoutes from '@modules/users/http/user.routes';

const router = Router();

// Mount feature routers (used under /api in app.ts)
router.use(authRoutes);
router.use(bookingRoutes);
router.use(equipmentRoutes);
router.use(formRoutes);
router.use(paymentRoutes);
router.use(roomRoutes);
router.use(subscriptionRoutes);
router.use(userRoutes);

export default router;
