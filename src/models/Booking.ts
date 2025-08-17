import { ObjectId } from 'mongodb';
	

export interface Booking {
  _id?: ObjectId;                                 // появится после insertOne
  userId: ObjectId;                               // кто бронировал
  roomId: ObjectId;                               // какой зал
  equipmentIds?: ObjectId[];                      // оборудование (если есть)
  start: Date;                                    // дата-время начала брони
  end: Date;                                      // дата-время окончания брони
  status: "pending" | "confirmed" | "cancelled" | "completed"; // статусы брони
  totalPrice: number;                             // итоговая сумма
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}