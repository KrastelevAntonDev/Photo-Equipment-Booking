import { Router } from 'express';
import multer from 'multer';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { requireAdminLevel } from '@shared/middlewares/admin.middleware';
import { authMiddleware } from '@shared/middlewares/auth.middleware';
import SmsController from './sms.controller';
import { SendSmsDTO } from './send-sms.dto';

const router = Router();
const controller = new SmsController();
const upload = multer({ dest: 'tmp/' });

// Send SMS (authorized users)
router.post('/sms/send', authMiddleware, validateDTO(SendSmsDTO), (req, res) => controller.send(req, res));

// Upload Viber image (admin)
router.post('/sms/viber/image', requireAdminLevel('full'), upload.single('img'), (req, res) => controller.uploadViberImage(req, res));

// Management endpoints (admin)
router.post('/sms/reject', requireAdminLevel('full'), (req, res) => controller.reject(req, res));
router.post('/sms/change-planned-time', requireAdminLevel('full'), (req, res) => controller.changePlannedTime(req, res));
router.post('/sms/info', requireAdminLevel('full'), (req, res) => controller.getInfo(req, res));
router.get('/sms/status', requireAdminLevel('full'), (req, res) => controller.getSmsStatus(req, res));
router.get('/sms/list', requireAdminLevel('full'), (req, res) => controller.getSmsList(req, res));
router.get('/sms/planned', requireAdminLevel('full'), (req, res) => controller.getPlannedSms(req, res));
router.get('/sms/statistics', requireAdminLevel('full'), (req, res) => controller.getStatistics(req, res));

// Phone bases and blacklist
router.post('/sms/phone-bases/:phoneBaseId/phones', requireAdminLevel('full'), (req, res) => controller.addPhonesToBase(req, res));
router.get('/sms/base-phones', requireAdminLevel('full'), (req, res) => controller.getBasePhones(req, res));
router.get('/sms/bases', requireAdminLevel('full'), (req, res) => controller.getUserBases(req, res));
router.get('/sms/blacklist', requireAdminLevel('full'), (req, res) => controller.getUserBlacklist(req, res));

// Templates and cascade
router.get('/sms/templates/vk', requireAdminLevel('full'), (req, res) => controller.listMessageTemplates(req, res));
router.get('/sms/cascade-schemes', requireAdminLevel('full'), (req, res) => controller.getCascadeSchemes(req, res));

// Sender creation (admin, with attachments)
router.post('/sms/senders', requireAdminLevel('full'), upload.array('attachments'), (req, res) => controller.createSender(req, res));

// Balance
router.get('/sms/balance', requireAdminLevel('full'), (req, res) => controller.getUserBalanceInfo(req, res));

// Webhook for SMS status updates
router.post('/sms/webhook', (req, res) => controller.webhook(req, res));

export default router;
