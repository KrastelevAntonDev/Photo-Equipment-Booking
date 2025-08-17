import { ObjectId } from 'mongodb';


export interface Equipment {
  _id?: ObjectId;                 // появится после insertOne
  name: string;
  description?: string;
  pricePerHour: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}