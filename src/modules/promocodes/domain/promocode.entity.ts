import { ObjectId } from 'mongodb';

export interface Promocode {
  _id?: ObjectId;
  code: string;                     // Уникальный код промокода (например, "ALAN")
  discountAmount: number;           // Сумма скидки в рублях
  isActive: boolean;                // Активен ли промокод
  expiresAt?: Date;                 // Дата истечения (опционально)
  usageLimit?: number;              // Максимальное количество использований
  usedCount: number;                // Сколько раз уже использован
  description?: string;             // Описание промокода
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}
