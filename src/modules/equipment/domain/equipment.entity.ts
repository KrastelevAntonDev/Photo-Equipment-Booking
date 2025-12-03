import { ObjectId } from 'mongodb';


export interface Equipment {
  _id?: ObjectId;                 // появится после insertOne
  name: string;
  description?: string;
  pricePerHour: number;
  image?: string;
  images?: string[];              // массив изображений с возможностью указания порядка
  totalQuantity?: number;         // Общее количество единиц оборудования
  bookedQuantity?: number;        // Количество забронированных единиц
  availableQuantity?: number;     // Доступное количество (вычисляемое: totalQuantity - bookedQuantity)
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}