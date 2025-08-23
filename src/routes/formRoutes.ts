import { Router } from 'express';
import { FormController } from '../controllers/FormController';
import { validateDTO } from '../middlewares/validation';
import { CreateFormDTO } from '../dtos/Form/CreateFormDTO';

const router = Router();
const formController = new FormController();

router.get('/forms', (req, res) => formController.getAllForms(req, res));
router.post('/form', validateDTO(CreateFormDTO), (req, res) => formController.createForm(req, res));
router.get('/form/:id', (req, res) => {
	formController.getFormById(req, res);
});
router.get('/form/type/:type', (req, res) =>{
	 formController.findByFormType(req, res);
});

export default router;