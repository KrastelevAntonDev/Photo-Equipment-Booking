import { IBookingRepository } from "../domain/booking.repository";
import { BookingMongoRepository } from "../infrastructure/booking.mongo.repository";
import { Booking, BookingWithUser, BusySlot } from "../domain/booking.entity";
import { IUserRepository } from "@modules/users/domain/user.repository";
import { UserMongoRepository } from "@modules/users/infrastructure/user.mongo.repository";
import { IRoomRepository } from "@modules/rooms/domain/room.repository";
import { RoomMongoRepository } from "@modules/rooms/infrastructure/room.mongo.repository";
import { IEquipmentRepository } from "@modules/equipment/domain/equipment.repository";
import { EquipmentMongoRepository } from "@modules/equipment/infrastructure/equipment.mongo.repository";
import { PromocodeService } from "@modules/promocodes/application/promocode.service";
import { normalizePhone } from "@shared/utils/phone.utils";
import { ObjectId } from "mongodb";

export class BookingService {
	private bookingRepository: IBookingRepository;
	private userRepository: IUserRepository;
	private roomRepository: IRoomRepository;
	private equipmentRepository: IEquipmentRepository;
	private promocodeService?: PromocodeService;

	constructor() {
		this.bookingRepository = new BookingMongoRepository();
		this.userRepository = new UserMongoRepository();
		this.roomRepository = new RoomMongoRepository();
		this.equipmentRepository = new EquipmentMongoRepository();
	}

	private getPromocodeService(): PromocodeService {
		if (!this.promocodeService) {
			const { getDB } = require('@/config/database');
			const { PromocodeMongoRepository } = require('@modules/promocodes/infrastructure/promocode.mongo.repository');
			const db = getDB();
			const promocodeRepository = new PromocodeMongoRepository(db);
			this.promocodeService = new PromocodeService(promocodeRepository);
		}
		return this.promocodeService;
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

		// Fallback: преобразуем старый формат equipmentIds в новый equipment с quantity=1
		if (!booking.equipment && booking.equipmentIds && booking.equipmentIds.length) {
			booking.equipment = booking.equipmentIds.map(id => ({
				equipmentId: id,
				quantity: 1
			}));
		}

		// Проверка оборудования (новый формат с количеством)
		if (booking.equipment && booking.equipment.length) {
			for (const item of booking.equipment) {
				const eq = await this.equipmentRepository.findById(item.equipmentId.toString());
				if (!eq) throw new Error(`Equipment not found: ${item.equipmentId}`);
				
				// Проверка доступного количества
				if (eq.totalQuantity && eq.totalQuantity > 0) {
					const available = (eq.totalQuantity || 0) - (eq.bookedQuantity || 0);
					if (item.quantity > available) {
						throw new Error(`Недостаточно единиц оборудования "${eq.name}". Доступно: ${available}, запрошено: ${item.quantity}`);
					}
				}
			}
		}

		// Проверка гримерных (новый формат)
		if (booking.makeupRooms && booking.makeupRooms.length) {
			const { MakeupRoomMongoRepository } = require('@modules/makeup-rooms/infrastructure/makeup-room.mongo.repository');
			const makeupRoomRepo = new MakeupRoomMongoRepository();
			
			// Рассчитываем длительность брони в часах
			const bookingDurationHours = (new Date(booking.end).getTime() - new Date(booking.start).getTime()) / (1000 * 60 * 60);
			
			for (const item of booking.makeupRooms) {
				const mr = await makeupRoomRepo.findById(item.makeupRoomId.toString());
				if (!mr) throw new Error(`Makeup room not found: ${item.makeupRoomId}`);
				
				// Проверка доступного количества
				const available = (mr.totalQuantity || 0) - (mr.bookedQuantity || 0);
				if (item.quantity > available) {
					throw new Error(`Недостаточно гримерных "${mr.name}". Доступно: ${available}, запрошено: ${item.quantity}`);
				}
				
				// Проверка времени аренды (не больше длительности брони)
				if (item.hours > bookingDurationHours) {
					throw new Error(`Количество часов аренды гримерной "${mr.name}" (${item.hours}ч) не может превышать длительность брони (${Math.floor(bookingDurationHours)}ч)`);
				}
				
				// Минимум 1 час
				if (item.hours < 1) {
					throw new Error(`Минимальное время аренды гримерной - 1 час`);
				}
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
		
		// Конвертируем equipment в ObjectId если используется новый формат
		const equipmentWithIds = booking.equipment
			? booking.equipment.map((item) => ({
				equipmentId: new ObjectId(item.equipmentId),
				quantity: item.quantity
			}))
			: undefined;
		
		// Конвертируем makeupRooms в ObjectId
		const makeupRoomsWithIds = booking.makeupRooms
			? booking.makeupRooms.map((item) => ({
				makeupRoomId: new ObjectId(item.makeupRoomId),
				quantity: item.quantity,
				hours: item.hours
			}))
			: undefined;
		
		// Рассчёт стоимости по новым правилам: тариф комнаты по времени + оборудование + гримерные
		let computedTotal = await this.computeTotalPriceWithEquipmentAndMakeup(
			booking.roomId.toString(),
			booking.equipment || [],
			booking.makeupRooms || [],
			booking.start,
			booking.end
		);

		// Применяем наценку за количество людей
		if (booking.people) {
			computedTotal = this.calculatePeopleSurcharge(computedTotal, booking.people);
		}

		// Применение промокода, если указан
		let finalPrice = computedTotal;
		let originalPrice: number | undefined;
		let discount: number | undefined;
		let promocodeData: string | undefined;
		let promocodeId: ObjectId | undefined;

		if (booking.promocode) {
			const promocodeService = this.getPromocodeService();
			const promoResult = await promocodeService.applyPromocode(
				booking.promocode,
				computedTotal
			);

			if (promoResult.success && promoResult.discountedAmount !== undefined) {
				originalPrice = computedTotal;
				finalPrice = promoResult.discountedAmount;
				discount = promoResult.discount;
				promocodeData = booking.promocode.toUpperCase();
				promocodeId = promoResult.promocode?._id;
			}
		}

		const newBody = {
			...booking,
			status: booking.status || "pending",
			roomId: new ObjectId(booking.roomId),
			userId: new ObjectId(userId),
			equipmentIds,
			equipment: equipmentWithIds,
			makeupRooms: makeupRoomsWithIds,
			createdAt: new Date(),
			updatedAt: new Date(),
			start: new Date(booking.start),
			end: new Date(booking.end),
			totalPrice: finalPrice,
			originalPrice,
			discount,
			promocode: promocodeData,
			promocodeId,
			paymentMethod: "online", // пользователь создаёт — оплата только онлайн
			isPaid: false,
			paidAmount: 0,
			paymentStatus: 'unpaid',
			// Новые поля
			type: booking.type,
			people: booking.people,
			bookingPaymentMethod: booking.paymentMethod,
			services: booking.services ? booking.services.map((id) => new ObjectId(id)) : undefined,
			entityType: booking.entityType,
		} as Booking;
		const newBooking = await this.bookingRepository.createBooking(newBody);

		// Интеграция с пользователем — добавляем bookingId в user.bookings
		await this.userRepository.addBookingToUser(
			userId.toString(),
			newBooking._id!.toString()
		);

		// === Планирование уведомлений для нового бронирования ===
		try {
			const { getDB } = require('@/config/database');
			const { NotificationService } = require('@modules/notifications/application/notification.service');
			const { NotificationMongoRepository } = require('@modules/notifications/infrastructure/notification.mongo.repository');
			const { SmsService } = require('@modules/sms/application/sms.service');
			const { BookingNotificationScheduler } = require('./booking-notification.scheduler');
			
			const db = getDB();
			const notificationRepository = new NotificationMongoRepository(db);
			const smsService = new SmsService();
			const notificationService = new NotificationService(notificationRepository, smsService);
			const scheduler = new BookingNotificationScheduler(notificationService);

			// Собираем данные для шаблона
			const equipmentNames: string[] = [];
			if (newBooking.equipmentIds && newBooking.equipmentIds.length > 0) {
				for (const eqId of newBooking.equipmentIds) {
					const eq = await this.equipmentRepository.findById(eqId.toString());
					if (eq) equipmentNames.push(eq.name);
				}
			}

			const templateData = BookingNotificationScheduler.createTemplateData(
				newBooking,
				room.name,
				equipmentNames
			);

			// Планируем уведомления
			await scheduler.scheduleNotificationsForNewBooking(newBooking, templateData);
			console.log(`📅 Notifications scheduled for booking ${newBooking._id}`);
		} catch (notifErr: any) {
			console.error('⚠️ Failed to schedule notifications:', notifErr.message);
			// Не прерываем создание бронирования из-за ошибки уведомлений
		}

		return newBooking;
	}

	async createBookingForUser(
		userId: string,
		payload: {
			roomId: string;
			equipmentIds?: string[];
			equipment?: Array<{ equipmentId: string; quantity: number }>;
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

		// Fallback: преобразуем старый формат equipmentIds в новый equipment с quantity=1
		if (!payload.equipment && payload.equipmentIds && payload.equipmentIds.length) {
			payload.equipment = payload.equipmentIds.map(id => ({
				equipmentId: id,
				quantity: 1
			}));
		}

		// Проверка оборудования (новый формат с количеством)
		if (payload.equipment && payload.equipment.length) {
			for (const item of payload.equipment) {
				const eq = await this.equipmentRepository.findById(item.equipmentId.toString());
				if (!eq) throw new Error(`Equipment not found: ${item.equipmentId}`);
				
				// Проверка доступного количества
				if (eq.totalQuantity && eq.totalQuantity > 0) {
					const available = (eq.totalQuantity || 0) - (eq.bookedQuantity || 0);
					if (item.quantity > available) {
						throw new Error(`Недостаточно единиц оборудования "${eq.name}". Доступно: ${available}, запрошено: ${item.quantity}`);
					}
				}
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
		
		// Конвертируем equipment в ObjectId если используется новый формат
		const equipmentWithIds = payload.equipment
			? payload.equipment.map((item) => ({
				equipmentId: new ObjectId(item.equipmentId),
				quantity: item.quantity
			}))
			: undefined;
		
		// В админском сценарии запрещаем online
		if (
			payload.paymentMethod !== "on_site_cash" &&
			payload.paymentMethod !== "on_site_card"
		) {
			throw new Error("Invalid payment method for admin booking");
		}
		
		// Рассчёт стоимости с учетом нового формата
		const computedTotal = await this.computeTotalPriceWithEquipment(
			payload.roomId.toString(),
			payload.equipment || [],
			startDate,
			endDate
		);
		
		const newBody: Booking = {
			userId: new ObjectId(userId),
			roomId: new ObjectId(payload.roomId),
			equipmentIds,
			equipment: equipmentWithIds,
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
				phone: user.phone ? normalizePhone(user.phone) : '',
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
				| "equipment"
				| "makeupRooms"
				| "people"
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
				typeof update.equipment !== 'undefined' ||
				typeof update.makeupRooms !== 'undefined' ||
				typeof update.people !== 'undefined' ||
				typeof update.start !== 'undefined' ||
				typeof update.end !== 'undefined');

		if (needReprice) {
			const targetRoomId = (update.roomId || existing.roomId).toString();
			
			// Используем новый формат equipment с quantity
			const targetEquipment = (update.equipment || existing.equipment || []).map((item: any) => ({
				equipmentId: typeof item.equipmentId === 'string' ? item.equipmentId : item.equipmentId.toString(),
				quantity: item.quantity || 1
			}));
			
			// Используем makeupRooms если есть
			const targetMakeupRooms = (update.makeupRooms || existing.makeupRooms || []).map((item: any) => ({
				makeupRoomId: typeof item.makeupRoomId === 'string' ? item.makeupRoomId : item.makeupRoomId.toString(),
				quantity: item.quantity || 1,
				hours: item.hours || 1
			}));
			
			// Используем новый метод расчета с учетом equipment и makeupRooms
			let computedTotal = await this.computeTotalPriceWithEquipmentAndMakeup(
				targetRoomId,
				targetEquipment,
				targetMakeupRooms,
				newStart,
				newEnd
			);
			
			// Применяем наценку за количество людей
			const targetPeople = update.people || existing.people;
			if (targetPeople) {
				computedTotal = this.calculatePeopleSurcharge(computedTotal, targetPeople);
			}
			
			update.totalPrice = computedTotal;
		}

		return this.bookingRepository.updatePartial(id, update);
	}

	// Сохраняем ссылку на оплату для дальнейших уведомлений
	async setPaymentUrl(bookingId: string, paymentUrl?: string): Promise<Booking | null> {
		if (!paymentUrl) {
			return this.bookingRepository.findById(bookingId);
		}
		return this.bookingRepository.updatePartial(bookingId, { paymentUrl });
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

	// Расчёт стоимости с учетом количества оборудования (новый метод)
	private async computeTotalPriceWithEquipment(
		roomId: string,
		equipment: Array<{ equipmentId: string | ObjectId; quantity: number }>,
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

		// Вычисляем длительность бронирования в часах
		const bookingDurationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

		// Рассчитываем стоимость оборудования: цена за час * quantity * часы бронирования
		let equipmentTotalPrice = 0;
		for (const item of equipment) {
			const eq = await this.equipmentRepository.findById(item.equipmentId.toString());
			if (!eq) throw new Error(`Equipment not found: ${item.equipmentId}`);
			equipmentTotalPrice += eq.pricePerDay * item.quantity * bookingDurationHours;
		}

		// Итерация по часовым сегментам для расчёта стоимости зала (только зал зависит от длительности)
		let roomTotalPrice = 0;
		let cursor = new Date(startDate);
		while (cursor < endDate) {
			const nextHour = new Date(cursor);
			nextHour.setMinutes(0, 0, 0);
			if (nextHour <= cursor) nextHour.setHours(nextHour.getHours() + 1);
			const segmentEnd = endDate < nextHour ? endDate : nextHour;
			const segmentHours = (segmentEnd.getTime() - cursor.getTime()) / 36e5;

			const roomRate = this.resolveRoomRate(room, cursor);
			roomTotalPrice += roomRate * segmentHours;

			cursor = segmentEnd;
		}

		// Итоговая цена = стоимость зала (зависит от времени) + стоимость оборудования (фиксированная)
		const total = roomTotalPrice + equipmentTotalPrice;
		return Math.round(total * 100) / 100;
	}

	// Расчёт стоимости с учетом оборудования и гримерных
	private async computeTotalPriceWithEquipmentAndMakeup(
		roomId: string,
		equipment: Array<{ equipmentId: string | ObjectId; quantity: number }>,
		makeupRooms: Array<{ makeupRoomId: string | ObjectId; quantity: number; hours: number }>,
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

		// Вычисляем длительность бронирования в часах
		const bookingDurationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

		// Рассчитываем стоимость оборудования: цена за час * quantity * часы бронирования
		let equipmentTotalPrice = 0;
		for (const item of equipment) {
			const eq = await this.equipmentRepository.findById(item.equipmentId.toString());
			if (!eq) throw new Error(`Equipment not found: ${item.equipmentId}`);
			equipmentTotalPrice += eq.pricePerDay * item.quantity * bookingDurationHours;
		}

		// Рассчитываем стоимость гримерных: цена за час * quantity * hours
		let makeupRoomsTotalPrice = 0;
		if (makeupRooms.length > 0) {
			const { MakeupRoomMongoRepository } = require('@modules/makeup-rooms/infrastructure/makeup-room.mongo.repository');
			const makeupRoomRepo = new MakeupRoomMongoRepository();
			
			for (const item of makeupRooms) {
				const mr = await makeupRoomRepo.findById(item.makeupRoomId.toString());
				if (!mr) throw new Error(`Makeup room not found: ${item.makeupRoomId}`);
				makeupRoomsTotalPrice += mr.pricePerHour * item.quantity * item.hours;
			}
		}

		// Итерация по часовым сегментам для расчёта стоимости зала
		let roomTotalPrice = 0;
		let cursor = new Date(startDate);
		while (cursor < endDate) {
			const nextHour = new Date(cursor);
			nextHour.setMinutes(0, 0, 0);
			if (nextHour <= cursor) nextHour.setHours(nextHour.getHours() + 1);
			const segmentEnd = endDate < nextHour ? endDate : nextHour;
			const segmentHours = (segmentEnd.getTime() - cursor.getTime()) / 36e5;

			const roomRate = this.resolveRoomRate(room, cursor);
			roomTotalPrice += roomRate * segmentHours;

			cursor = segmentEnd;
		}

		// Итоговая цена = зал + оборудование + гримерные
		const total = roomTotalPrice + equipmentTotalPrice + makeupRoomsTotalPrice;
		return Math.round(total * 100) / 100;
	}

	// Расчёт наценки за количество людей
	private calculatePeopleSurcharge(basePrice: number, people: string): number {
		let surchargePercent = 0;
		
		switch (people) {
			case '11-20':
				surchargePercent = 10; // Свыше 10 человек – 10%
				break;
			case '21-30':
				surchargePercent = 15; // Свыше 20 человек – 15%
				break;
			case '31-40':
				surchargePercent = 25; // Свыше 30 человек – 25%
				break;
			case 'more-than-40':
				surchargePercent = 40; // Свыше 40 человек – 40%
				break;
			default:
				surchargePercent = 0; // До 10 человек – без наценки
		}
		
		const surcharge = basePrice * (surchargePercent / 100);
		return Math.round((basePrice + surcharge) * 100) / 100;
	}

	// Расчёт стоимости по тарифам: покомпонентно по часам/получасам с учётом пятницы с 17:00 и выходных/праздников
	// Старый метод для совместимости с equipmentIds
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

		// Стоимость оборудования (фиксированная за сутки, НЕ зависит от длительности)
		let equipmentTotalPrice = 0;
		for (const eqId of equipmentIds) {
			const eq = await this.equipmentRepository.findById(eqId.toString());
			if (!eq) throw new Error(`Equipment not found: ${eqId}`);
			equipmentTotalPrice += eq.pricePerDay;
		}

		// Итерация по часовым сегментам для расчёта стоимости зала (только зал зависит от длительности)
		let roomTotalPrice = 0;
		let cursor = new Date(startDate);
		while (cursor < endDate) {
			const nextHour = new Date(cursor);
			nextHour.setMinutes(0, 0, 0);
			if (nextHour <= cursor) nextHour.setHours(nextHour.getHours() + 1);
			const segmentEnd = endDate < nextHour ? endDate : nextHour;
			const segmentHours = (segmentEnd.getTime() - cursor.getTime()) / 36e5;

			const roomRate = this.resolveRoomRate(room, cursor);
			roomTotalPrice += roomRate * segmentHours;

			cursor = segmentEnd;
		}

		// Итоговая цена = стоимость зала + стоимость оборудования (фиксированная за сутки)
		const total = roomTotalPrice + equipmentTotalPrice;
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
		// Приводим время к бизнес-часовому поясу, чтобы правильно подбирать тарифы.
		// Например, для Москвы используем смещение +3 часа.
		const offsetHours = Number(3);
		const localDt = new Date(dt.getTime() + offsetHours * 3600_000);
		const isWeekendOrHoliday = this.isWeekend(localDt) || this.isHoliday(localDt);

		const pickRate = (...rates: Array<number | undefined>): number => {
			for (const rate of rates) {
				if (typeof rate === 'number') {
					return rate;
				}
			}
			return 0;
		};

		if (isWeekendOrHoliday) {
			return pickRate(
				pricing.weekend_holiday_00_24,
				pricing.weekday_12_24,
				pricing.weekday_00_12,
				room.pricePerHour,
			);
		}

		const hour = localDt.getHours();
		const isMorning = hour < 12;

		return pickRate(
			isMorning ? pricing.weekday_00_12 : pricing.weekday_12_24,
			isMorning ? pricing.weekday_12_24 : pricing.weekday_00_12,
			pricing.weekend_holiday_00_24,
			room.pricePerHour,
		);
	}

	/**
	 * Добавление оборудования и/или гримерных комнат к существующему бронированию
	 * Логика оплаты:
	 * - Если бронирование уже оплачено (isPaid=true) - создаем счет только на добавленные позиции
	 * - Если бронирование не оплачено - обновляем totalPrice и создаем счет на всю сумму
	 */
	async addItemsToBooking(
		bookingId: string,
		equipment?: Array<{ equipmentId: string; quantity: number }>,
		makeupRooms?: Array<{ makeupRoomId: string; quantity: number; hours: number }>
	): Promise<{ booking: Booking; additionalPrice: number }> {
		// Получаем бронирование
		const booking = await this.bookingRepository.findById(bookingId);
		if (!booking) {
			throw new Error('Booking not found');
		}

		if (booking.status === 'cancelled' || booking.isDeleted) {
			throw new Error('Cannot add items to cancelled or deleted booking');
		}

		// Вычисляем длительность бронирования в часах
		const bookingDurationHours = (new Date(booking.end).getTime() - new Date(booking.start).getTime()) / (1000 * 60 * 60);

		// Проверка и расчет стоимости нового оборудования
		let additionalEquipmentPrice = 0;
		const newEquipment: Array<{ equipmentId: ObjectId; quantity: number }> = [];

		if (equipment && equipment.length > 0) {
			for (const item of equipment) {
				const eq = await this.equipmentRepository.findById(item.equipmentId);
				if (!eq) throw new Error(`Equipment not found: ${item.equipmentId}`);

				// Проверка доступного количества
				if (eq.totalQuantity && eq.totalQuantity > 0) {
					const available = (eq.totalQuantity || 0) - (eq.bookedQuantity || 0);
					if (item.quantity > available) {
						throw new Error(`Недостаточно единиц оборудования "${eq.name}". Доступно: ${available}, запрошено: ${item.quantity}`);
					}
				}

				additionalEquipmentPrice += eq.pricePerDay * item.quantity * bookingDurationHours;
				newEquipment.push({
					equipmentId: new ObjectId(item.equipmentId),
					quantity: item.quantity
				});
			}
		}

		// Проверка и расчет стоимости новых гримерных
		let additionalMakeupRoomsPrice = 0;
		const newMakeupRooms: Array<{ makeupRoomId: ObjectId; quantity: number; hours: number }> = [];

		if (makeupRooms && makeupRooms.length > 0) {
			const { MakeupRoomMongoRepository } = require('@modules/makeup-rooms/infrastructure/makeup-room.mongo.repository');
			const makeupRoomRepo = new MakeupRoomMongoRepository();

			// Рассчитываем длительность брони в часах
			const bookingDurationHours = (new Date(booking.end).getTime() - new Date(booking.start).getTime()) / (1000 * 60 * 60);

			for (const item of makeupRooms) {
				const mr = await makeupRoomRepo.findById(item.makeupRoomId);
				if (!mr) throw new Error(`Makeup room not found: ${item.makeupRoomId}`);

				// Проверка доступного количества
				const available = (mr.totalQuantity || 0) - (mr.bookedQuantity || 0);
				if (item.quantity > available) {
					throw new Error(`Недостаточно гримерных "${mr.name}". Доступно: ${available}, запрошено: ${item.quantity}`);
				}

				// Проверка времени аренды
				if (item.hours > bookingDurationHours) {
					throw new Error(`Количество часов аренды гримерной "${mr.name}" (${item.hours}ч) не может превышать длительность брони (${Math.floor(bookingDurationHours)}ч)`);
				}

				if (item.hours < 1) {
					throw new Error(`Минимальное время аренды гримерной - 1 час`);
				}

				additionalMakeupRoomsPrice += mr.pricePerHour * item.quantity * item.hours;
				newMakeupRooms.push({
					makeupRoomId: new ObjectId(item.makeupRoomId),
					quantity: item.quantity,
					hours: item.hours
				});
			}
		}

		// Общая дополнительная стоимость
		const additionalPrice = additionalEquipmentPrice + additionalMakeupRoomsPrice;

		// Объединяем существующее и новое оборудование
		const existingEquipment = booking.equipment || [];
		const mergedEquipment = [...existingEquipment, ...newEquipment];

		// Объединяем существующие и новые гримерные
		const existingMakeupRooms = booking.makeupRooms || [];
		const mergedMakeupRooms = [...existingMakeupRooms, ...newMakeupRooms];

		// Обновляем бронирование
		const updatedFields: Partial<Booking> = {
			equipment: mergedEquipment.length > 0 ? mergedEquipment : undefined,
			makeupRooms: mergedMakeupRooms.length > 0 ? mergedMakeupRooms : undefined,
			totalPrice: booking.totalPrice + additionalPrice,
			updatedAt: new Date()
		};

		// Обновляем бронирование в БД
		const updatedBooking = await this.bookingRepository.updatePartial(bookingId, updatedFields);
		if (!updatedBooking) {
			throw new Error('Failed to update booking');
		}

		return {
			booking: updatedBooking,
			additionalPrice
		};
	}
}
