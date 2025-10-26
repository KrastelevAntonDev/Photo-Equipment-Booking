import { ObjectId } from 'mongodb';


export interface Room {
  _id?: ObjectId;                 // появится после insertOne
  name: string;
  address: string;
  area: number;                                   // площадь (кв.м)
  pricePerHour: number;                           // цена за час
  colorScheme: string[];                          // массив цветовых гамм (например: ['white', 'loft', ...])
  styles: string[];                               // массив стилей (например: ['modern', 'classic', ...])
  description: string;                           // описание
  images: string[];                              // ссылки на фото
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}