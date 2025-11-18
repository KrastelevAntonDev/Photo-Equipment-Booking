import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { env } from '@config/env';
import { P1SmsCreateRequest, P1SmsCreateResponse, P1SmsProvider, P1SmsStatusResponse, P1SmsUploadImageResponse } from '../../../domain/sms.provider';

export class P1SmsHttpProvider implements P1SmsProvider {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey = env.P1SMS_API_KEY, baseURL = env.P1SMS_BASE_URL) {
    if (!apiKey) throw new Error('P1SMS_API_KEY is not configured');
    this.apiKey = apiKey;
    this.client = axios.create({ baseURL, timeout: 20000 });
  }

  async create(payload: P1SmsCreateRequest): Promise<P1SmsCreateResponse> {
    const body = { ...payload, apiKey: this.apiKey };
    const { data } = await this.client.post('/apiSms/create', body, { headers: { 'Content-Type': 'application/json' } });
    return data as P1SmsCreateResponse;
  }

  async loadImage(filePath: string): Promise<P1SmsUploadImageResponse> {
    const form = new FormData();
    form.append('apiKey', this.apiKey);
    form.append('img', fs.createReadStream(path.resolve(filePath)));
    const { data } = await this.client.post('/apiSms/loadImage', form, { headers: form.getHeaders() });
    return data as P1SmsUploadImageResponse;
  }

  async reject(smsId: number[]): Promise<any> {
    const body = { apiKey: this.apiKey, smsId };
    const { data } = await this.client.post('/apiSms/reject', body);
    return data;
  }

  async changePlannedTime(smsId: number[], plannedAt: number): Promise<any> {
    const body = { apiKey: this.apiKey, smsId, plannedAt };
    const { data } = await this.client.post('/apiSms/changePlannedTime', body);
    return data;
  }

  async getInfo(apiSmsIdList: number[]): Promise<any> {
    const body = { apiKey: this.apiKey, apiSmsIdList };
    const { data } = await this.client.post('/apiSms/get', body);
    return data;
  }

  async getSmsStatus(smsId: number[]): Promise<P1SmsStatusResponse> {
    const params = new URLSearchParams();
    params.set('apiKey', this.apiKey);
    smsId.forEach((id, idx) => params.append('smsId[' + idx + ']', String(id)));
    const url = '/apiSms/getSmsStatus?' + params.toString();
    const { data } = await this.client.get(url);
    return data as P1SmsStatusResponse;
  }

  async getSmsList(query: Record<string, any>): Promise<any> {
    const params = new URLSearchParams({ apiKey: this.apiKey, ...Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)])) });
    const { data } = await this.client.get('/apiUsers/getSmsList?' + params.toString());
    return data;
  }

  async getPlannedSms(page?: number): Promise<any> {
    const params = new URLSearchParams({ apiKey: this.apiKey });
    if (page) params.set('page', String(page));
    const { data } = await this.client.get('/apiUsers/getPlannedSms?' + params.toString());
    return data;
  }

  async getStatistics(query: Record<string, any>): Promise<any> {
    const params = new URLSearchParams({ apiKey: this.apiKey, ...Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)])) });
    const { data } = await this.client.get('/api/v2/statistics?' + params.toString());
    return data;
  }

  async addPhonesToBase(phoneBaseId: number, phones: { phone: string; additionalcolumns?: any }[]): Promise<any> {
    const body = { apiKey: this.apiKey, phones };
    const { data } = await this.client.post(`/apiPhoneBases/${phoneBaseId}/phones`, body);
    return data;
  }

  async getBasePhones(baseId: number, page?: number, column?: string, order?: 'asc' | 'desc'): Promise<any> {
    const params = new URLSearchParams({ apiKey: this.apiKey, baseId: String(baseId) });
    if (page) params.set('page', String(page));
    if (column) params.set('column', column);
    if (order) params.set('order', order);
    const { data } = await this.client.get('/apiUsers/getBasePhones?' + params.toString());
    return data;
  }

  async getUserBases(): Promise<any> {
    const { data } = await this.client.get('/apiUsers/getUserBases', { params: { apiKey: this.apiKey } });
    return data;
  }

  async getUserBlacklist(page?: number): Promise<any> {
    const params = new URLSearchParams({ apiKey: this.apiKey });
    if (page) params.set('page', String(page));
    const { data } = await this.client.get('/apiUsers/getUserBlacklist?' + params.toString());
    return data;
  }

  async listMessageTemplates(): Promise<any> {
    const { data } = await this.client.get('/apiSms/listMessageTemplates', { params: { apiKey: this.apiKey } });
    return data;
  }

  async getCascadeSchemes(search?: string): Promise<any> {
    const params = new URLSearchParams({ apiKey: this.apiKey });
    if (search) params.set('search', search);
    const { data } = await this.client.get('/apiSms/getCascadeSchemes?' + params.toString());
    return data;
  }

  async createSender(payload: { type: string; name: string; companyName: string; link: string; attachments?: string[] }): Promise<any> {
    const form = new FormData();
    form.append('apiKey', this.apiKey);
    form.append('type', payload.type);
    form.append('name', payload.name);
    form.append('companyName', payload.companyName);
    form.append('link', payload.link);
    if (payload.attachments) {
      payload.attachments.forEach((p) => form.append('attachments[]', fs.createReadStream(path.resolve(p))));
    }
    const { data } = await this.client.post('/apiSenders/create', form, { headers: form.getHeaders() });
    return data;
  }

  async getUserBalanceInfo(): Promise<any> {
    const { data } = await this.client.get('/apiUsers/getUserBalanceInfo', { params: { apiKey: this.apiKey } });
    return data;
  }
}

export default P1SmsHttpProvider;
