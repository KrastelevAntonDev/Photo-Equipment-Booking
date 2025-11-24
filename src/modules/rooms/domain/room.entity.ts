import { ObjectId } from 'mongodb';


export interface Room {
  _id?: ObjectId;                 // появится после insertOne
  name: string;
  address: string;
  area: number;                                   // площадь (кв.м)
  pricePerHour: number;                           // базовая цена за час (по умолчанию, например weekday_12_24)
  category?: string;                              // категория из прайса (Эксклюзив, Премиум, ...)
  minBookingHours?: number;                       // минимальное время брони (часы)
  ceilingHeightMeters?: number;                   // высота потолков (метры)
  features?: string[];                            // произвольные фичи (Profoto D2, гримерный стол и т.д.)
  sharedSpace?: boolean;                          // признак общей зоны
  cycWall?: boolean;                              // циклорама
  hasMakeupTable?: boolean;                       // гримерный стол
  noPassSystem?: boolean;                         // отсутствие проходной системы
  pricing?: {                                     // новые правила тарификации
    weekday_00_12?: number;
    weekday_12_24?: number;
    fri_17_24?: number;
    weekend_holiday_00_24?: number;
  };
  colorScheme: string[];                          // массив цветовых гамм (например: ['white', 'loft', ...])
  styles: string[];                               // массив стилей (например: ['modern', 'classic', ...])
  description: string;                           // описание
  images: string[];                              // ссылки на фото
  isAvailable?: boolean;                         // флаг доступности зала (для отображения)
  availableFrom?: Date;                          // дата начала работы зала
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}