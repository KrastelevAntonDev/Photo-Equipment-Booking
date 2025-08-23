import { Router } from 'express';
import { SubscribeController } from '../controllers/SubscribeController';
import { validateDTO } from '../middlewares/validation';
import { CreateSubscribeDTO } from '../dtos/Subscribe/CreateSubscribeDTO';

const router = Router();
const subscribeController = new SubscribeController();

router.get('/subscribes', (req, res) => subscribeController.getAllSubscribes(req, res));
router.post('/subscribes', validateDTO(CreateSubscribeDTO), (req, res) => subscribeController.createSubscribe(req, res));
router.get('/subscribes/:id', (req, res) => {
	subscribeController.getSubscribeById(req, res);
});
export default router;