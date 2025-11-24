import { AtolClient } from '../../../infrastructure/external/atol/atol.client';
import {
  AtolSellRequest,
  AtolPaymentType,
  AtolTaxSystem,
  AtolVatType,
  AtolPaymentObject,
  AtolPaymentMethod,
  AtolSellResponse,
  AtolReportResponse
} from '../../../infrastructure/external/atol/atol.types';
import { env } from '../../../config/env';

export interface CreateReceiptParams {
  externalId: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  paymentType: 'cash' | 'card';
  totalAmount: number;
}

export class AtolService {
  private client: AtolClient;

  constructor() {
    this.client = new AtolClient({
      login: env.ATOL_LOGIN,
      password: env.ATOL_PASSWORD,
      groupCode: env.ATOL_GROUP_CODE,
      baseUrl: env.ATOL_BASE_URL || 'https://online.atol.ru',
      inn: env.ATOL_INN,
      paymentAddress: env.ATOL_PAYMENT_ADDRESS,
      companyEmail: env.ATOL_COMPANY_EMAIL
    });
  }

  /**
   * Создание чека для оплаты на месте
   */
  async createReceipt(params: CreateReceiptParams): Promise<AtolSellResponse> {
    const request: AtolSellRequest = {
      timestamp: new Date().toISOString(),
      external_id: params.externalId,
      receipt: {
        client: {
          email: params.customerEmail,
          phone: params.customerPhone,
          name: params.customerName
        },
        company: {
          email: env.ATOL_COMPANY_EMAIL || 'info@photo-booking.ru',
          sno: AtolTaxSystem.USN_Income,
          inn: env.ATOL_INN,
          payment_address: env.ATOL_PAYMENT_ADDRESS
        },
        items: params.items.map(item => ({
          name: item.name.substring(0, 128), // Максимум 128 символов
          price: item.price,
          quantity: item.quantity,
          sum: item.price * item.quantity,
          measurement_unit: 'шт',
          payment_method: AtolPaymentMethod.FullPayment,
          payment_object: AtolPaymentObject.Service,
          vat: {
            type: AtolVatType.None // Без НДС (для УСН обычно так)
          }
        })),
        payments: [
          {
            type: params.paymentType === 'cash' 
              ? AtolPaymentType.Cash 
              : AtolPaymentType.Electronically,
            sum: params.totalAmount
          }
        ],
        total: params.totalAmount
      }
    };

    return await this.client.createSellReceipt(request);
  }

  /**
   * Создание чека возврата
   */
  async createRefund(params: CreateReceiptParams): Promise<AtolSellResponse> {
    const request: AtolSellRequest = {
      timestamp: new Date().toISOString(),
      external_id: `refund_${params.externalId}`,
      receipt: {
        client: {
          email: params.customerEmail,
          phone: params.customerPhone,
          name: params.customerName
        },
        company: {
          email: env.ATOL_COMPANY_EMAIL || 'info@photo-booking.ru',
          sno: AtolTaxSystem.USN_Income,
          inn: env.ATOL_INN,
          payment_address: env.ATOL_PAYMENT_ADDRESS
        },
        items: params.items.map(item => ({
          name: item.name.substring(0, 128),
          price: item.price,
          quantity: item.quantity,
          sum: item.price * item.quantity,
          measurement_unit: 'шт',
          payment_method: AtolPaymentMethod.FullPayment,
          payment_object: AtolPaymentObject.Service,
          vat: {
            type: AtolVatType.None
          }
        })),
        payments: [
          {
            type: params.paymentType === 'cash' 
              ? AtolPaymentType.Cash 
              : AtolPaymentType.Electronically,
            sum: params.totalAmount
          }
        ],
        total: params.totalAmount
      }
    };

    return await this.client.createRefundReceipt(request);
  }

  /**
   * Получение статуса чека
   */
  async getReceiptStatus(uuid: string): Promise<AtolReportResponse> {
    return await this.client.getReport(uuid);
  }

  /**
   * Ожидание готовности чека
   */
  async waitForReceipt(uuid: string): Promise<AtolReportResponse> {
    return await this.client.waitForReceipt(uuid);
  }
}
