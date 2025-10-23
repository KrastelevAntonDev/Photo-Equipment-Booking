import { IFormRepository } from '../domain/form.repository';
import { FormMongoRepository } from '../infrastructure/form.mongo.repository';
import { Form, FormType } from '../domain/form.entity';

export class FormService {
	private formRepository: IFormRepository;

	constructor() {
		this.formRepository = new FormMongoRepository();
	}

	async getAllForms(): Promise<Form[]> {
		return this.formRepository.findAll();
	}

	async createForm(form: Form): Promise<Form> {
		return this.formRepository.createForm(form);
	}

	async getFormById(id: string): Promise<Form | null> {
		return this.formRepository.findById(id);
	}
	async findByFormType(type: FormType): Promise<Form[]> {
		return this.formRepository.findByFormType(type);
	}
}