import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;                 // появится после insertOne
  email: string;
  passwordHash: string;
  phone?: string;
  fullName?: string;
  favoriteRoomIds?: ObjectId[];   // если хранишь ссылки на другие документы
  balance: number;
  points: number;
  bookings: ObjectId[];           // ссылки на бронирования
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastBookingAt?: Date;
  isDeleted?: boolean;
}

export interface UserJwtPayload {
  userId: string;
  email: string;
  phone: string;
  fullName?: string;
  iat: number;
  exp: number;
}