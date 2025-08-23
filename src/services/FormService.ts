import { FormRepository } from '../repositories/FormRepository';
import { Form, FormType } from '../models/Form';

export class FormService {
	private formRepository: FormRepository;

	constructor() {
		this.formRepository = new FormRepository();
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