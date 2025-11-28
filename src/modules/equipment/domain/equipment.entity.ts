import { ObjectId } from 'mongodb';


export interface Equipment {
  _id?: ObjectId;                 // появится после insertOne
  name: string;
  description?: string;
  pricePerHour: number;
  image?: string;
  totalQuantity?: number;         // Общее количество единиц оборудования
  bookedQuantity?: number;        // Количество забронированных единиц
  availableQuantity?: number;     // Доступное количество (вычисляемое: totalQuantity - bookedQuantity)
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}