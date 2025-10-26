import { ObjectId } from 'mongodb';

export interface Admin {
  _id?: ObjectId;                 // появится после insertOne
  email: string;
  passwordHash: string;
  phone?: string;
  accessLevel?: 'full' | 'partial';
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}

export interface AdminJwtPayload {
	userId: string;
	email: string;
	phone: string;
  accessLevel?: 'full' | 'partial';
	iat: number;
	exp: number;
}