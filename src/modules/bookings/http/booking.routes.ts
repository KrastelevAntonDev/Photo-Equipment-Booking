import { Router } from 'express';
import { BookingController } from './booking.controller';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { CreateBookingDTO } from './create-booking.dto';
import { authMiddleware } from '@shared/middlewares/auth.middleware';
import { adminMiddleware } from '@shared/middlewares/admin.middleware';

const router = Router();
const bookingController = new BookingController();

router.get('/bookings', (req, res) => bookingController.getAllBookings(req, res));
router.post('/bookings', authMiddleware, validateDTO(CreateBookingDTO), (req, res) => {
	bookingController.createBooking(req, res)
});
router.get('/bookings/room/:id', (req, res) => {
	bookingController.getBookingByIdRoom(req, res);
});
router.get('/bookings/booking/:id', (req, res) => {
	bookingController.getBookingById(req, res);
});

router.get('/booking/busy-slots', (req, res) => {
	bookingController.getBusySlots(req, res);
});
export default router;	