import { ObjectId } from 'mongodb';
export enum PaymentCurrency {
	RUB = 'RUB',
	USD = 'USD',
	EUR = 'EUR',
}
export interface Payment {
  _id?: ObjectId; // MongoDB ID
  bookingId: ObjectId; // Ссылка на бронь
  userId: ObjectId; // Ссылка на пользователя
  yookassaId: string; // ID платежа в YooKassa
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: number; // Сумма платежа (после применения скидки)
  originalAmount?: number; // Исходная сумма до применения скидки
  discount?: number; // Размер скидки
  promocode?: string; // Использованный промокод
  promocodeId?: ObjectId; // ID промокода
  currency: PaymentCurrency;
  description?: string;
  paid: boolean;
  refundable: boolean;
  refundedAmount?: number;
  paidAt?: Date; // Дата/время успешной оплаты по данным провайдера
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
  // Можно добавить дополнительные поля по необходимости
}



