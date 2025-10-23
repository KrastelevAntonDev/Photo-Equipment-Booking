import { Request, Response } from 'express';
import { FormService } from '../application/form.service';
import { Form, FormType } from '../domain/form.entity';

export class FormController {
	private formService: FormService;

	constructor() {
		this.formService = new FormService();
	}

	async getAllForms(req: Request, res: Response) {
		try {
			const forms = await this.formService.getAllForms();
			res.json(forms);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(500).json({ message: errorMessage });
		}
	}

	async createForm(req: Request, res: Response) {
		try {
			const form: Form = req.body;
			const newForm = await this.formService.createForm(form);
			res.status(201).json(newForm);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(500).json({ message: errorMessage });
		}
	}

	async getFormById(req: Request, res: Response) {
		try {
			const form = await this.formService.getFormById(req.params.id);
			if (!form) {
				return res.status(404).json({ message: 'Form not found' });
			}
			res.json(form);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(500).json({ message: errorMessage });
		}
	}

	async findByFormType(req: Request, res: Response) {
		try {
			const forms = await this.formService.findByFormType(req.params.type as FormType);
			res.json(forms);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(500).json({ message: errorMessage });
		}
	}
}