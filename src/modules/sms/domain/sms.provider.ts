export interface P1SmsCreateRequest {
  apiKey: string;
  webhookUrl?: string;
  sms: Array<{
    phone: string;
    text?: string;
    link?: string;
    linkTtl?: number;
    channel: string;
    sender?: string;
    plannedAt?: number;
    viberParameters?: {
      type: 'text' | 'link' | 'phone';
      btnText?: string;
      btnLink?: string;
      btnPhone?: string;
      imageHash?: string;
      smsLifetime?: number;
    };
    vkParameters?: {
      templateId: number;
      tmpl_data: string; // JSON string
      userId?: number;
      pushToken?: string;
      pushApp?: string;
      pushEncrypt?: 0 | 1;
      userIp?: string;
      ttl?: number;
      issueTime?: number;
    };
    header?: { text: string };
    waParameters?: {
      template: string;
      language: string;
    };
    cascadeSchemeId?: number;
    cascade?: any; // provider-specific cascade object
    tag?: string;
    randomizer?: 0 | 1;
    randomizerOptions?: {
      translate?: 0 | 1;
      locked?: string[];
    };
  }>;
}

export interface P1SmsCreateResponse {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}

export interface P1SmsUploadImageResponse {
  status: 'success' | 'error';
  data?: string; // image hash / filename
}

export interface P1SmsStatusItem {
  sms_id: number;
  sms_status: string;
  receive_date: string;
}

export interface P1SmsStatusResponse extends Array<P1SmsStatusItem> {}

export interface P1SmsProvider {
  create(payload: P1SmsCreateRequest): Promise<P1SmsCreateResponse>;
  loadImage(filePath: string): Promise<P1SmsUploadImageResponse>;
  reject(smsId: number[]): Promise<any>;
  changePlannedTime(smsId: number[], plannedAt: number): Promise<any>;
  getInfo(apiSmsIdList: number[]): Promise<any>;
  getSmsStatus(smsId: number[]): Promise<P1SmsStatusResponse>;
  getSmsList(query: Record<string, any>): Promise<any>;
  getPlannedSms(page?: number): Promise<any>;
  getStatistics(query: Record<string, any>): Promise<any>;
  addPhonesToBase(phoneBaseId: number, phones: { phone: string; additionalcolumns?: any }[]): Promise<any>;
  getBasePhones(baseId: number, page?: number, column?: string, order?: 'asc' | 'desc'): Promise<any>;
  getUserBases(): Promise<any>;
  getUserBlacklist(page?: number): Promise<any>;
  listMessageTemplates(): Promise<any>;
  getCascadeSchemes(search?: string): Promise<any>;
  createSender(payload: { type: string; name: string; companyName: string; link: string; attachments?: string[] }): Promise<any>;
  getUserBalanceInfo(): Promise<any>;
}
