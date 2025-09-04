import { ObjectId } from 'mongodb';

export interface Payment {
  _id?: ObjectId; // MongoDB ID
  bookingId: ObjectId; // Ссылка на бронь
  userId: ObjectId; // Ссылка на пользователя
  yookassaId: string; // ID платежа в YooKassa
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: number; // Сумма платежа
  currency: 'RUB' | 'USD' | 'EUR';
  description?: string;
  paid: boolean;
  refundable: boolean;
  refundedAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
  // Можно добавить дополнительные поля по необходимости
}



