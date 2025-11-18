import { SmsMongoRepository } from '../infrastructure/sms.mongo.repository';
import { ISmsRepository, SmsMessage, SmsWebhookUpdate } from '../domain/sms.entity';
import { P1SmsCreateRequest, P1SmsProvider } from '../domain/sms.provider';
import P1SmsHttpProvider from '../infrastructure/external/p1sms/p1sms.provider';

export class SmsService {
  private repo: ISmsRepository;
  private provider: P1SmsProvider;

  constructor() {
    this.repo = new SmsMongoRepository();
    this.provider = new P1SmsHttpProvider();
  }

  async send(payload: Omit<P1SmsCreateRequest, 'apiKey'>) {
		console.log('Sending SMS with payload:', payload);
    const res = await this.provider.create(payload as P1SmsCreateRequest);
		console.log('Received response from SMS provider:', res);
    // Provider returns complex data; we store request/response for audit
    const created: SmsMessage[] = [];
    const messages = (payload.sms || []) as any[];
    // If provider returns ids list in data, try to pair; otherwise store without provider id
    const data = (res as any)?.data;
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const providerSmsId = Array.isArray(data) ? data[i]?.id ?? data[i]?.smsId : data?.id ?? data?.smsId;
      const toSave: SmsMessage = {
        providerSmsId: typeof providerSmsId === 'number' ? providerSmsId : undefined,
        phone: msg.phone,
        channel: msg.channel,
        sender: msg.sender,
        text: msg.text,
        link: msg.link,
        linkTtl: msg.linkTtl,
        plannedAt: msg.plannedAt,
        tag: msg.tag,
        status: undefined,
        rawRequest: msg,
        rawResponse: res,
      };
      const saved = await this.repo.insertMessage(toSave);
      created.push(saved);
    }
    return { providerResponse: res, messages: created };
  }

  async uploadViberImage(localPath: string) {
    return this.provider.loadImage(localPath);
  }

  async reject(smsId: number[]) { return this.provider.reject(smsId); }
  async changePlannedTime(smsId: number[], plannedAt: number) { return this.provider.changePlannedTime(smsId, plannedAt); }
  async getInfo(apiSmsIdList: number[]) { return this.provider.getInfo(apiSmsIdList); }
  async getSmsStatus(smsId: number[]) { return this.provider.getSmsStatus(smsId); }
  async getSmsList(query: Record<string, any>) { return this.provider.getSmsList(query); }
  async getPlannedSms(page?: number) { return this.provider.getPlannedSms(page); }
  async getStatistics(query: Record<string, any>) { return this.provider.getStatistics(query); }
  async addPhonesToBase(phoneBaseId: number, phones: { phone: string; additionalcolumns?: any }[]) { return this.provider.addPhonesToBase(phoneBaseId, phones); }
  async getBasePhones(baseId: number, page?: number, column?: string, order?: 'asc' | 'desc') { return this.provider.getBasePhones(baseId, page, column, order); }
  async getUserBases() { return this.provider.getUserBases(); }
  async getUserBlacklist(page?: number) { return this.provider.getUserBlacklist(page); }
  async listMessageTemplates() { return this.provider.listMessageTemplates(); }
  async getCascadeSchemes(search?: string) { return this.provider.getCascadeSchemes(search); }
  async createSender(payload: { type: string; name: string; companyName: string; link: string; attachments?: string[] }) { return this.provider.createSender(payload); }
  async getUserBalanceInfo() { return this.provider.getUserBalanceInfo(); }

  async handleWebhook(update: SmsWebhookUpdate) {
    if (!update || typeof update.sms_id !== 'number') return;
    const patch: Partial<SmsMessage> = {};
    if (update.sms_status) patch.status = update.sms_status as any;
    if (update.receive_date) patch.updatedAt = new Date(update.receive_date);
    await this.repo.updateByProviderId(update.sms_id, patch);
  }
}

export default SmsService;
