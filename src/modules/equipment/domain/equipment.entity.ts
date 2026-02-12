import { ObjectId } from 'mongodb';


export interface Equipment {
  _id?: ObjectId;                 // появится после insertOne
  name: string;
  description?: string;
  pricePerDay: number;            // цена за час (название pricePerDay осталось для совместимости, но фактически это цена за час)
  image?: string;
  images?: string[];              // массив изображений с возможностью указания порядка
  totalQuantity?: number;         // Общее количество единиц оборудования
  bookedQuantity?: number;        // Количество забронированных единиц
  availableQuantity?: number;     // Доступное количество (вычисляемое: totalQuantity - bookedQuantity)
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}