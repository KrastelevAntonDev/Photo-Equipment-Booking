import { ObjectId } from 'mongodb';

export type SmsChannel = 'digit' | 'char' | 'viber' | 'vk' | 'whatsapp' | 'ww' | 'zip' | 'telegram' | 'auth' | 'ping' | 'hit';

export type SmsStatus = 'created' | 'moderation' | 'sent' | 'error' | 'delivered' | 'not_delivered' | 'read' | 'planned' | 'low_balance' | 'low_partner_balance' | 'rejected';

export interface SmsMessage {
  _id?: ObjectId;
  providerSmsId?: number;
  phone: string; // E.164 without + (11 digits per provider spec)
  channel: SmsChannel;
  sender?: string;
  text?: string;
  link?: string;
  linkTtl?: number;
  plannedAt?: number; // unix seconds
  tag?: string;
  status?: SmsStatus;
  cost?: string;
  createdAt?: Date;
  updatedAt?: Date;
  rawRequest?: any;
  rawResponse?: any;
}

export interface SmsWebhookUpdate {
  sms_id?: number;
  sms_status?: SmsStatus;
  receive_date?: string; // 'YYYY-MM-DD HH:mm:ss'
  // Accept unknown fields for forward compatibility
  [k: string]: any;
}

export interface ISmsRepository {
  insertMessage(doc: SmsMessage): Promise<SmsMessage>;
  updateByProviderId(providerSmsId: number, patch: Partial<SmsMessage>): Promise<void>;
  findByProviderId(providerSmsId: number): Promise<SmsMessage | null>;
}
