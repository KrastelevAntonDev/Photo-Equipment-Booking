import { ObjectId } from 'mongodb';
import { UserJwtPayload } from '../../users/domain/user.entity';
	

export interface BookingEquipment {
  equipmentId: ObjectId;                          // ID оборудования
  quantity: number;                               // количество единиц
}

export interface Booking {
  _id?: ObjectId;                                 // появится после insertOne
  userId: ObjectId;                               // кто бронировал
  roomId: ObjectId;                               // какой зал
  equipmentIds?: ObjectId[];                      // оборудование (старый формат для совместимости)
  equipment?: BookingEquipment[];                 // оборудование с количеством (новый формат)
  start: Date;                                    // дата-время начала брони
  end: Date;                                      // дата-время окончания брони
  status: "pending" | "confirmed" | "cancelled" | "completed"; // статусы брони
  totalPrice: number;                             // итоговая сумма
  originalPrice?: number;                         // исходная цена до применения промокода
  discount?: number;                              // размер скидки (если применён промокод)
  promocode?: string;                             // использованный промокод
  promocodeId?: ObjectId;                         // ID промокода
  paymentMethod?: 'online' | 'on_site_cash' | 'on_site_card'; // способ оплаты
  isPaid?: boolean;                               // признак полной оплаты
  paidAmount?: number;                            // сколько оплачено суммарно
  paymentStatus?: 'unpaid' | 'partial' | 'paid';  // состояние оплаты
  isHalfPaid?: boolean;                           // признак половинной оплаты (около 50%)
  user?: UserJwtPayload;                          // данные пользователя (для отображения без джоина)
  
  // Уведомления
  notificationsSent?: string[];                   // типы отправленных уведомлений
  cancelledAt?: Date;                             // время автоматической отмены
  cancellationReason?: string;                    // причина отмены
  
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

export interface BusySlot {
  roomId: string;
  start: Date; // ISO 8601
  end: Date;   // ISO 8601
  status: 'pending' | 'confirmed';
};

export type BookingWithUser = Booking & {user: UserJwtPayload};