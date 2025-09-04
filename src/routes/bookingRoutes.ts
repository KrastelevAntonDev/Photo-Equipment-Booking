import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import { validateDTO } from '../middlewares/validation';
import { CreateBookingDTO } from '../dtos/Booking/CreateBookingDTO';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();
const bookingController = new BookingController();

router.get('/bookings', adminMiddleware, (req, res) => bookingController.getAllBookings(req, res));
router.post('/bookings', authMiddleware, validateDTO(CreateBookingDTO), (req, res) => {
	bookingController.createBooking(req, res)
});
router.get('/bookings/:id', (req, res) => {
	bookingController.getBookingByIdRoom(req, res);
});
router.get('/bookings/busy-slots', (req, res) => {
	bookingController.getBusySlots(req, res);
});
export default router;	