import { ObjectId } from 'mongodb';


export interface Equipment {
  _id?: ObjectId;                 // появится после insertOne
  name: string;
  description?: string;
  pricePerDay: number;            // цена за сутки (24 часа), независимо от длительности бронирования
  image?: string;
  images?: string[];              // массив изображений с возможностью указания порядка
  totalQuantity?: number;         // Общее количество единиц оборудования
  bookedQuantity?: number;        // Количество забронированных единиц
  availableQuantity?: number;     // Доступное количество (вычисляемое: totalQuantity - bookedQuantity)
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}