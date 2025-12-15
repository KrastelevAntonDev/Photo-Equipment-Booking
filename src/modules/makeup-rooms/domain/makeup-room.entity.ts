import { ObjectId } from 'mongodb';

export interface MakeupRoom {
  _id?: ObjectId;
  name: string;
  description?: string;
  pricePerHour: number;
  totalQuantity: number;
  bookedQuantity?: number;
  images?: string[];
  isAvailable?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}
