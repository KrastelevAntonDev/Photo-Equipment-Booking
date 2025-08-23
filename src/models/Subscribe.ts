import { ObjectId } from 'mongodb';


export interface Subscribe {
	_id?: ObjectId;                 // появится после insertOne
	email: string;
	checkbox: boolean;
	createdAt: Date;
	updatedAt: Date;
	isDeleted?: boolean;
}
