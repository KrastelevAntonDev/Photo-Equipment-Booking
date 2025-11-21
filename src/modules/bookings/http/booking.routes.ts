import { Router } from 'express';
import { BookingController } from './booking.controller';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { CreateBookingDTO } from './create-booking.dto';
import { authMiddleware } from '@shared/middlewares/auth.middleware';
import { requireAdminLevel } from '@shared/middlewares/admin.middleware';
import { UpdateBookingDTO } from './update-booking.dto';
import { AdminCreateBookingDTO } from './admin-create-booking.dto';
import { PromocodeService } from '@modules/promocodes/application/promocode.service';
import { PromocodeMongoRepository } from '@modules/promocodes/infrastructure/promocode.mongo.repository';
import { getDB } from '@/config/database';

const router = Router();

// Инициализация сервиса промокодов
const db = getDB();
const promocodeRepository = new PromocodeMongoRepository(db);
const promocodeService = new PromocodeService(promocodeRepository);

const bookingController = new BookingController(promocodeService);

router.get('/bookings', authMiddleware, (req, res) => bookingController.getAllBookings(req, res));
router.post('/bookings', authMiddleware, validateDTO(CreateBookingDTO), (req, res) => {
	bookingController.createBooking(req, res)
});
router.get('/get-booking-info-by-room/:id', authMiddleware, (req, res) => {
	bookingController.getBookingByIdRoom(req, res);
});
router.get('/get-booking-info/:id', authMiddleware, (req, res) => {
	bookingController.getBookingById(req, res);
});

router.get('/booking/busy-slots', (req, res) => {
	bookingController.getBusySlots(req, res);
});

// Update booking (admin panel)
router.put('/bookings/:id', requireAdminLevel('partial'), validateDTO(UpdateBookingDTO), (req, res) => {
  bookingController.updateBooking(req, res);
});

// Create booking by admin for a user
router.post('/admin/create-booking', requireAdminLevel('partial'), validateDTO(AdminCreateBookingDTO), (req, res) => {
	bookingController.adminCreateBooking(req, res);
});
export default router;	