import { Request, Response } from 'express';
import SmsService from '../application/sms.service';
import { SendSmsDTO } from './send-sms.dto';

export class SmsController {
  private service: SmsService;
  constructor() { this.service = new SmsService(); }

  async send(req: Request, res: Response) {
    try {
      const dto = req.body as SendSmsDTO;
      const result = await this.service.send({ webhookUrl: dto.webhookUrl, sms: dto.sms } as any);
      res.status(201).json(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(400).json({ message: msg });
    }
  }

  async uploadViberImage(req: Request, res: Response) {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) return res.status(400).json({ message: 'File is required' });
      const result = await this.service.uploadViberImage(file.path);
      res.json(result);
    } catch (e) { res.status(400).json({ message: e instanceof Error ? e.message : String(e) }); }
  }

  async reject(req: Request, res: Response) {
    const { smsId } = req.body as { smsId: number[] };
    const r = await this.service.reject(smsId);
    res.json(r);
  }
  async changePlannedTime(req: Request, res: Response) {
    const { smsId, plannedAt } = req.body as { smsId: number[]; plannedAt: number };
    const r = await this.service.changePlannedTime(smsId, plannedAt);
    res.json(r);
  }
  async getInfo(req: Request, res: Response) {
    const { apiSmsIdList } = req.body as { apiSmsIdList: number[] };
    const r = await this.service.getInfo(apiSmsIdList);
    res.json(r);
  }
  async getSmsStatus(req: Request, res: Response) {
    const ids = ([] as string[]).concat(req.query.smsId as any || []).map((s) => Number(s));
    const r = await this.service.getSmsStatus(ids);
    res.json(r);
  }
  async getSmsList(req: Request, res: Response) {
    const r = await this.service.getSmsList(req.query as any);
    res.json(r);
  }
  async getPlannedSms(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const r = await this.service.getPlannedSms(page);
    res.json(r);
  }
  async getStatistics(req: Request, res: Response) {
    const r = await this.service.getStatistics(req.query as any);
    res.json(r);
  }
  async addPhonesToBase(req: Request, res: Response) {
    const baseId = Number(req.params.phoneBaseId);
    const { phones } = req.body as { phones: { phone: string; additionalcolumns?: any }[] };
    const r = await this.service.addPhonesToBase(baseId, phones);
    res.json(r);
  }
  async getBasePhones(req: Request, res: Response) {
    const baseId = Number(req.query.baseId);
    const page = req.query.page ? Number(req.query.page) : undefined;
    const column = req.query.column ? String(req.query.column) : undefined;
    const order = (req.query.order as any) as 'asc' | 'desc' | undefined;
    const r = await this.service.getBasePhones(baseId, page, column, order);
    res.json(r);
  }
  async getUserBases(req: Request, res: Response) {
    const r = await this.service.getUserBases();
    res.json(r);
  }
  async getUserBlacklist(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const r = await this.service.getUserBlacklist(page);
    res.json(r);
  }
  async listMessageTemplates(req: Request, res: Response) {
    const r = await this.service.listMessageTemplates();
    res.json(r);
  }
  async getCascadeSchemes(req: Request, res: Response) {
    const search = req.query.search ? String(req.query.search) : undefined;
    const r = await this.service.getCascadeSchemes(search);
    res.json(r);
  }
  async createSender(req: Request, res: Response) {
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const attachments = files?.map((f) => f.path);
    const { type, name, companyName, link } = req.body as any;
    const r = await this.service.createSender({ type, name, companyName, link, attachments });
    res.json(r);
  }
  async getUserBalanceInfo(req: Request, res: Response) {
    const r = await this.service.getUserBalanceInfo();
    res.json(r);
  }
  async webhook(req: Request, res: Response) {
    try {
      await this.service.handleWebhook(req.body as any);
      res.status(200).send('OK');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).send(msg || 'ERROR');
    }
  }
}

export default SmsController;
