import { Router } from 'express';
import { FormController } from './form.controller';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { CreateFormDTO } from './create-form.dto';
import { adminMiddleware } from '@/shared/middlewares/admin.middleware';
const router = Router();
const formController = new FormController();

router.get('/forms', adminMiddleware, (req, res) => formController.getAllForms(req, res));
router.post('/form', validateDTO(CreateFormDTO), (req, res) => formController.createForm(req, res));
router.get('/form/:id', adminMiddleware, (req, res) => {
	formController.getFormById(req, res);
});
router.get('/form/type/:type', adminMiddleware, (req, res) =>{
	 formController.findByFormType(req, res);
});

export default router;