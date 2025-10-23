import { ObjectId } from 'mongodb';

export interface Admin {
  _id?: ObjectId;                 // появится после insertOne
  email: string;
  passwordHash: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}

export interface AdminJwtPayload {
	userId: string;
	email: string;
	phone: string;
	iat: number;
	exp: number;
}