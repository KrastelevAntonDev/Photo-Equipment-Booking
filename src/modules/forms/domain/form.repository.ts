import { Form, FormType } from './form.entity';

export interface IFormRepository {
	findAll(): Promise<Form[]>;
	createForm(form: Form): Promise<Form>;
	findById(id: string): Promise<Form | null>;
	findByFormType(type: FormType): Promise<Form[]>;
}

export default IFormRepository;

