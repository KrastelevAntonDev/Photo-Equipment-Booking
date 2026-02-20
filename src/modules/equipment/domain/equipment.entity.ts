import { ObjectId } from 'mongodb';


export interface Equipment {
  _id?: ObjectId;                 // появится после insertOne
  name: string;
  description?: string;
  pricePerDay: number;            // Фиксированная цена за всё время бронирования (независимо от длительности). Название pricePerDay сохранено для совместимости, но это НЕ цена за сутки.
  image?: string;
  images?: string[];              // массив изображений с возможностью указания порядка
  totalQuantity?: number;         // Общее количество единиц оборудования
  bookedQuantity?: number;        // Количество забронированных единиц
  availableQuantity?: number;     // Доступное количество (вычисляемое: totalQuantity - bookedQuantity)
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}