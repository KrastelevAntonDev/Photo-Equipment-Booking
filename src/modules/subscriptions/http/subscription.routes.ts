import { Router } from 'express';
import { SubscribeController } from './subscription.controller';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { CreateSubscribeDTO } from './create-subscribe.dto';
import { adminMiddleware } from '@/shared/middlewares/admin.middleware';
const router = Router();
const subscribeController = new SubscribeController();

router.get('/subscribes', adminMiddleware, (req, res) => subscribeController.getAllSubscribes(req, res));
router.post('/subscribes', validateDTO(CreateSubscribeDTO), (req, res) => subscribeController.createSubscribe(req, res));
router.get('/subscribes/:id', adminMiddleware, (req, res) => {
	subscribeController.getSubscribeById(req, res);
});
export default router;