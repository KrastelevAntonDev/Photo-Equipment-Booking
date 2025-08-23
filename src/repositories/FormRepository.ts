import { Collection, ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { Form, FormType } from '../models/Form';

export class FormRepository {
	private collection: Collection<Form> | null = null;

	private getCollection(): Collection<Form> {
		if (!this.collection) {
			this.collection = getDB().collection<Form>('form');
		}
		return this.collection;
	}

	async findAll(): Promise<Form[]> {
		return this.getCollection().find().toArray();
	}

	async createForm(form: Form): Promise<Form> {
		const result = await this.getCollection().insertOne(form);
		return { ...form, _id: result.insertedId };
	}

	async findById(id: string): Promise<Form | null> {
		if (!ObjectId.isValid(id)) {
			 throw new Error('Invalid ID format');
		}
		const _id = new ObjectId(id);
		return this.getCollection().findOne({ _id });
	}
	async findByFormType(type: FormType): Promise<Form[]> {
		if (!Object.values(FormType).includes(type)) {
			throw new Error('Invalid form type');
		}
		return this.getCollection().find({ formType: type }).toArray();
	}
}