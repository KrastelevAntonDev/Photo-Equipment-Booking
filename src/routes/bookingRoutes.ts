import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import { validateDTO } from '../middlewares/validation';
import { CreateBookingDTO } from '../dtos/Booking/CreateBookingDTO';

const router = Router();
const bookingController = new BookingController();

router.get('/bookings', (req, res) => bookingController.getAllBookings(req, res));
router.post('/bookings', validateDTO(CreateBookingDTO), (req, res) => bookingController.createBooking(req, res));
// router.get('/bookings/:id', (req, res) => bookingController.getBookingById(req, res));

export default router;