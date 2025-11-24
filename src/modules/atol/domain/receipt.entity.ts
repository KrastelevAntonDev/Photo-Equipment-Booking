import { ObjectId } from 'mongodb';

export enum ReceiptStatus {
  Wait = 'wait',
  Done = 'done',
  Fail = 'fail'
}

export interface FiscalData {
  fiscalReceiptNumber: number;
  shiftNumber: number;
  receiptDatetime: string;
  fnNumber: string;
  ecrRegistrationNumber: string;
  fiscalDocumentNumber: number;
  fiscalDocumentAttribute: number;
  fnsSite: string;
  ofdInn: string;
  ofdReceiptUrl?: string;
}

export class Receipt {
  _id?: ObjectId;
  bookingId: ObjectId;
  paymentId?: ObjectId;
  externalId: string;        // Внешний ID для АТОЛ
  atolUuid?: string;         // UUID чека в АТОЛ
  status: ReceiptStatus;
  paymentType: 'cash' | 'card';
  totalAmount: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  fiscalData?: FiscalData;   // Данные после фискализации
  error?: string;            // Ошибка, если есть
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Receipt>) {
    this._id = data._id;
    this.bookingId = data.bookingId!;
    this.paymentId = data.paymentId;
    this.externalId = data.externalId!;
    this.atolUuid = data.atolUuid;
    this.status = data.status || ReceiptStatus.Wait;
    this.paymentType = data.paymentType!;
    this.totalAmount = data.totalAmount!;
    this.items = data.items || [];
    this.customerEmail = data.customerEmail;
    this.customerPhone = data.customerPhone;
    this.customerName = data.customerName;
    this.fiscalData = data.fiscalData;
    this.error = data.error;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
