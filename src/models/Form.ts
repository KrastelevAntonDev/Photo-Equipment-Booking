import { ObjectId } from 'mongodb';

export enum FormType {
	CONTACT = 'contact',
	BOOKING_FOOD = 'booking_food',
	FEEDBACK = 'feedback'
}

export interface Form {
	_id?: ObjectId;                 // появится после insertOne
	name: string;
	email: string;
	phone: string;
	servicesType: string;
	textarea: string;
	checkbox: boolean;
	formType: FormType;
	createdAt: Date;
	updatedAt: Date;
	isDeleted?: boolean;
}
