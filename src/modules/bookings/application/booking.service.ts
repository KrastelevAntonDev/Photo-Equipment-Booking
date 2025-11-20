import { IBookingRepository } from "../domain/booking.repository";
import { BookingMongoRepository } from "../infrastructure/booking.mongo.repository";
import { Booking, BookingWithUser, BusySlot } from "../domain/booking.entity";
import { IUserRepository } from "@modules/users/domain/user.repository";
import { UserMongoRepository } from "@modules/users/infrastructure/user.mongo.repository";
import { IRoomRepository } from "@modules/rooms/domain/room.repository";
import { RoomMongoRepository } from "@modules/rooms/infrastructure/room.mongo.repository";
import { IEquipmentRepository } from "@modules/equipment/domain/equipment.repository";
import { EquipmentMongoRepository } from "@modules/equipment/infrastructure/equipment.mongo.repository";
import { ObjectId } from "mongodb";

export class BookingService {
	private bookingRepository: IBookingRepository;
	private userRepository: IUserRepository;
	private roomRepository: IRoomRepository;
	private equipmentRepository: IEquipmentRepository;

	constructor() {
		this.bookingRepository = new BookingMongoRepository();
		this.userRepository = new UserMongoRepository();
		this.roomRepository = new RoomMongoRepository();
		this.equipmentRepository = new EquipmentMongoRepository();
	}

	async getAllBookings(): Promise<Booking[]> {
		return this.bookingRepository.findAll();
	}
	async updateBookingStatus(
		id: string,
		status: "pending" | "confirmed" | "cancelled" | "completed"
	): Promise<Booking | null> {
		return this.bookingRepository.updateStatus(id, status);
	}
	async createBooking(booking: BookingWithUser): Promise<Booking> {
		// Проверка пользователя

		const userId = booking.user.userId;
		const user = await this.userRepository.findById(userId.toString());
		if (!user) throw new Error("User not found");
		console.log(user);

		// Проверка зала
		const room = await this.roomRepository.findById(booking.roomId.toString());
		if (!room) throw new Error("Room not found");
		console.log(room);

		// Проверка оборудования
		if (booking.equipmentIds && booking.equipmentIds.length) {
			for (const eqId of booking.equipmentIds) {
				const eq = await this.equipmentRepository.findById(eqId.toString());
				if (!eq) throw new Error(`Equipment not found: ${eqId}`);
			}
		}

		// Проверка пересечения времени бронирования для зала
		const overlap = await this.bookingRepository.findOverlap(
			booking.roomId.toString(),
			booking.start,
			booking.end
		);
		if (overlap.length > 0)
			throw new Error("Room already booked for this time");
		console.log(overlap);

		// Создаем бронирование
		const equipmentIds = booking.equipmentIds
			? booking.equipmentIds.map((id) => new ObjectId(id))
			: [];
		// Рассчёт стоимости по новым правилам: тариф комнаты по времени + оборудование
		const eqIdsForPrice = (booking.equipmentIds || []).map((id: any) =>
			id.toString()
		);
		const computedTotal = await this.computeTotalPrice(
			booking.roomId.toString(),
			eqIdsForPrice,
			booking.start,
			booking.end
		);
		const newBody = {
			...booking,
			status: "pending",
			roomId: new ObjectId(booking.roomId),
			userId: new ObjectId(userId),
			equipmentIds,
			createdAt: new Date(),
			updatedAt: new Date(),
			start: new Date(booking.start),
			end: new Date(booking.end),
			totalPrice: computedTotal,
			paymentMethod: "online", // пользователь создаёт — оплата только онлайн
			isPaid: false,
			paidAmount: 0,
			paymentStatus: 'unpaid',
		} as Booking;
		const newBooking = await this.bookingRepository.createBooking(newBody);

		// Интеграция с пользователем — добавляем bookingId в user.bookings
		await this.userRepository.addBookingToUser(
			userId.toString(),
			newBooking._id!.toString()
		);

		return newBooking;
	}

	async createBookingForUser(
		userId: string,
		payload: {
			roomId: string;
			equipmentIds?: string[];
			start: string | Date;
			end: string | Date;
			totalPrice?: number;
			paymentMethod: "on_site_cash" | "on_site_card";
		}
	): Promise<Booking> {
		// Проверка пользователя
		const user = await this.userRepository.findById(userId.toString());
		if (!user) throw new Error("User not found");

		// Проверка зала
		const room = await this.roomRepository.findById(payload.roomId.toString());
		if (!room) throw new Error("Room not found");

		// Проверка оборудования
		if (payload.equipmentIds && payload.equipmentIds.length) {
			for (const eqId of payload.equipmentIds) {
				const eq = await this.equipmentRepository.findById(eqId.toString());
				if (!eq) throw new Error(`Equipment not found: ${eqId}`);
			}
		}

		const startDate = new Date(payload.start);
		const endDate = new Date(payload.end);
		if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
			throw new Error("Invalid start date");
		}
		if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
			throw new Error("Invalid end date");
		}
		if (endDate <= startDate) {
			throw new Error("End time must be after start time");
		}

		// Проверка пересечения времени бронирования для зала
		const overlap = await this.bookingRepository.findOverlap(
			payload.roomId.toString(),
			startDate,
			endDate
		);
		if (overlap.length > 0)
			throw new Error("Room already booked for this time");

		const equipmentIds = payload.equipmentIds
			? payload.equipmentIds.map((id) => new ObjectId(id))
			: [];
		// В админском сценарии запрещаем online
		if (
			payload.paymentMethod !== "on_site_cash" &&
			payload.paymentMethod !== "on_site_card"
		) {
			throw new Error("Invalid payment method for admin booking");
		}
		const computedTotal = await this.computeTotalPrice(
			payload.roomId.toString(),
			payload.equipmentIds || [],
			startDate,
			endDate
		);
		const newBody: Booking = {
			userId: new ObjectId(userId),
			roomId: new ObjectId(payload.roomId),
			equipmentIds,
			start: startDate,
			end: endDate,
			status: "pending",
			totalPrice: computedTotal,
			createdAt: new Date(),
			updatedAt: new Date(),
			paymentMethod: payload.paymentMethod,
			isPaid: false,
			paidAmount: 0,
			paymentStatus: 'unpaid',
			user: {
				userId: user._id!.toString(),
				email: user.email,
				phone: user.phone || '',
				fullName: user.fullName || user.email,
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 86400, // +24 часа
			},
		};

		const newBooking = await this.bookingRepository.createBooking(newBody);
		await this.userRepository.addBookingToUser(
			userId.toString(),
			newBooking._id!.toString()
		);
		return newBooking;
	}

	async getBookingById(id: string): Promise<Booking | null> {
		return this.bookingRepository.findById(id);
	}
	async getBookingByIdRoom(id: string): Promise<Booking | null> {
		return this.bookingRepository.findByIdRoom(id);
	}
		async getBookingsForUser(userId: string): Promise<Booking[]> {
			return this.bookingRepository.findByUserId(userId);
		}
	async getBusySlots(
		roomId: string,
		rangeStart: Date,
		rangeEnd: Date
	): Promise<BusySlot[]> {
		const bookings = await this.bookingRepository.findBusySlots(
			roomId,
			rangeStart,
			rangeEnd
		);
		return bookings.map((b) => ({
			roomId: b.roomId.toString(),
			start: b.start,
			end: b.end,
			status: b.status as "pending" | "confirmed",
		}));
	}

	async setOnSitePayment(
		bookingId: string,
		method: "on_site_cash" | "on_site_card"
	): Promise<Booking | null> {
		// просто зафиксируем способ оплаты и поставим isPaid = false (оплата на месте позже)
		return this.bookingRepository.updatePaymentInfo(bookingId, {
			paymentMethod: method,
			isPaid: false,
		});
	}

	async updateBooking(
		id: string,
		update: Partial<
			Pick<
				Booking,
				| "roomId"
				| "equipmentIds"
				| "start"
				| "end"
				| "status"
				| "totalPrice"
				| "paymentMethod"
				| "isPaid"
			>
		>
	): Promise<Booking | null> {
		const existing = await this.bookingRepository.findById(id);
		if (!existing) return null;

		// Валидация временных границ
		const newStart = update.start ? new Date(update.start) : existing.start;
		const newEnd = update.end ? new Date(update.end) : existing.end;
		if (newStart && newEnd && newEnd <= newStart) {
			throw new Error("End time must be after start time");
		}

		// Целевая комната для проверки пересечений
		const targetRoomId = (update.roomId || existing.roomId).toString();

		// Проверка пересечения времени брони для зала (исключая текущую бронь)
		const overlap = await this.bookingRepository.findOverlap(
			targetRoomId,
			newStart,
			newEnd
		);
		const conflicts = overlap.filter(
			(b) => b._id?.toString() !== existing._id?.toString()
		);
		if (conflicts.length > 0) {
			throw new Error("Room already booked for this time");
		}

		// Пересчёт стоимости, если менялись ключевые параметры и totalPrice явно не передан
		const needReprice =
			typeof update.totalPrice === 'undefined' &&
			(typeof update.roomId !== 'undefined' ||
				typeof update.equipmentIds !== 'undefined' ||
				typeof update.start !== 'undefined' ||
				typeof update.end !== 'undefined');

		if (needReprice) {
			const targetRoomId = (update.roomId || existing.roomId).toString();
			const targetEquip = (update.equipmentIds || existing.equipmentIds || []).map((e: any) => e.toString());
			const computedTotal = await this.computeTotalPrice(
				targetRoomId,
				targetEquip,
				newStart,
				newEnd
			);
			update.totalPrice = computedTotal;
		}

		return this.bookingRepository.updatePartial(id, update);
	}

		// Регистрируем входящий платёж: увеличиваем paidAmount, пересчитываем статусы
		async registerPayment(bookingId: string, amount: number): Promise<Booking | null> {
			const booking = await this.bookingRepository.findById(bookingId);
			if (!booking) return null;
			const currentPaid = booking.paidAmount ?? 0;
			const total = booking.totalPrice ?? 0;
			if (total <= 0) return booking; // некорректная сумма брони
			// Защита от повторных вебхуков: не превышаем total
			const targetPaid = Math.min(total, Math.max(0, currentPaid + amount));
			const fullyPaid = targetPaid + 1e-6 >= total; // погрешность
			const paymentStatus = fullyPaid ? 'paid' : targetPaid > 0 ? 'partial' : 'unpaid';
			// Определяем половинную оплату: считаем половинной если оплачено 45%-55% от общей суммы
			const halfThreshold = total * 0.5;
			const isHalfPaid = !fullyPaid && targetPaid >= halfThreshold * 0.9 && targetPaid <= halfThreshold * 1.1;
			// Если повторный вебхук не изменяет сумму — просто возвращаем текущее состояние
			if (targetPaid === currentPaid && booking.paymentStatus === paymentStatus && booking.isPaid === fullyPaid && booking.isHalfPaid === isHalfPaid) {
				return booking;
			}
			const updated = await this.bookingRepository.updatePartial(bookingId, {
				paidAmount: Math.round(targetPaid * 100) / 100,
				paymentStatus,
				isPaid: fullyPaid,
				isHalfPaid,
			});
			if (updated && fullyPaid && updated.status === 'pending') {
				await this.updateBookingStatus(bookingId, 'confirmed');
				return this.bookingRepository.findById(bookingId);
			}
			return updated;
		}

	// Расчёт стоимости по тарифам: покомпонентно по часам/получасам с учётом пятницы с 17:00 и выходных/праздников
	private async computeTotalPrice(
		roomId: string,
		equipmentIds: string[],
		start: Date | string,
		end: Date | string
	): Promise<number> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) throw new Error("Room not found");

		const startDate = new Date(start);
		const endDate = new Date(end);
		if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
			throw new Error("Invalid start date");
		}
		if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
			throw new Error("Invalid end date");
		}
		if (endDate <= startDate)
			throw new Error("End time must be after start time");

		// Минимальная длительность брони
		if (room.minBookingHours && room.minBookingHours > 0) {
			const diffH = (endDate.getTime() - startDate.getTime()) / 36e5;
			if (diffH + 1e-9 < room.minBookingHours) {
				throw new Error(`Минимальное время брони для зала "${room.name}" — ${room.minBookingHours} ч.`);
			}
		}

		let equipmentSum = 0;
		for (const eqId of equipmentIds) {
			const eq = await this.equipmentRepository.findById(eqId.toString());
			if (!eq) throw new Error(`Equipment not found: ${eqId}`);
			equipmentSum += eq.pricePerHour;
		}

		// Итерация по часовым сегментам (с учётом неполных часов)
		let total = 0;
		let cursor = new Date(startDate);
		while (cursor < endDate) {
			const nextHour = new Date(cursor);
			nextHour.setMinutes(0, 0, 0);
			if (nextHour <= cursor) nextHour.setHours(nextHour.getHours() + 1);
			const segmentEnd = endDate < nextHour ? endDate : nextHour;
			const segmentHours = (segmentEnd.getTime() - cursor.getTime()) / 36e5;

			const roomRate = this.resolveRoomRate(room, cursor);
			total += (roomRate + equipmentSum) * segmentHours;

			cursor = segmentEnd;
		}

		return Math.round(total * 100) / 100;
	}

	private isWeekend(d: Date): boolean {
		const day = d.getDay(); // 0=Sunday,6=Saturday
		return day === 0 || day === 6;
	}

	// Праздники можно подключать из конфига; пока пусто
	private isHoliday(_d: Date): boolean {
		return false;
	}

	private resolveRoomRate(room: any, dt: Date): number {
		const pricing = room.pricing || {};
		const hour = dt.getHours();
		const isFri = dt.getDay() === 5;
		const weekendOrHoliday = this.isWeekend(dt) || this.isHoliday(dt);

		if (weekendOrHoliday) {
			if (typeof pricing.weekend_holiday_00_24 === 'number') return pricing.weekend_holiday_00_24;
		}
		if (isFri && hour >= 17) {
			if (typeof pricing.fri_17_24 === 'number') return pricing.fri_17_24;
			if (typeof pricing.weekend_holiday_00_24 === 'number') return pricing.weekend_holiday_00_24;
		}

		// Будни и пятница до 17:00
		if (hour < 12) {
			if (typeof pricing.weekday_00_12 === 'number') return pricing.weekday_00_12;
		} else {
			if (typeof pricing.weekday_12_24 === 'number') return pricing.weekday_12_24;
		}

		// Фоллбек — используем базовую цену, если правила не заданы
		return room.pricePerHour || 0;
	}
}
