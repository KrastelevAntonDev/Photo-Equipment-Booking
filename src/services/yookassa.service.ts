import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import {
  Amount,
  CreatePaymentRequest,
  CreateRefundRequest,
  Payment,
  Refund,
  ApiError,
  WebhookNotification,
  PaymentMethod,
} from '../types/yookassa.types';

export class YooKassaService {
  private readonly baseUrl: string = 'https://api.yookassa.ru/v3';
  private readonly shopId: string;
  private readonly secretKey: string;
  private readonly basicAuth: string;
  private readonly axiosInstance: AxiosInstance;

  constructor(shopId: string, secretKey: string) {
    if (!shopId || !secretKey) {
      throw new Error('Shop ID and Secret Key are required');
    }
    this.shopId = shopId;
    this.secretKey = secretKey;
    this.basicAuth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Basic ${this.basicAuth}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
    idempotencyKey?: string,
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      if (idempotencyKey) {
        headers['Idempotence-Key'] = idempotencyKey;
      }

      const response: AxiosResponse<T> = await this.axiosInstance.request({
        method,
        url: path,
        data: body,
        headers,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(`${apiError.code}: ${apiError.description}`);
      }
      throw new Error(error.message || 'Unknown error occurred');
    }
  }

  public async createPayment(payload: CreatePaymentRequest): Promise<Payment> {
    const idempotencyKey = this.generateIdempotencyKey();
    return this.makeRequest<Payment>('POST', '/payments', payload, idempotencyKey);
  }

  public async getPayment(paymentId: string): Promise<Payment> {
    return this.makeRequest<Payment>('GET', `/payments/${paymentId}`);
  }

  public async capturePayment(paymentId: string, amount?: Amount): Promise<Payment> {
    const idempotencyKey = this.generateIdempotencyKey();
    return this.makeRequest<Payment>('POST', `/payments/${paymentId}/capture`, amount ? { amount } : undefined, idempotencyKey);
  }

  public async cancelPayment(paymentId: string): Promise<Payment> {
    const idempotencyKey = this.generateIdempotencyKey();
    return this.makeRequest<Payment>('POST', `/payments/${paymentId}/cancel`, undefined, idempotencyKey);
  }

  public async createRefund(payload: CreateRefundRequest): Promise<Refund> {
    const idempotencyKey = this.generateIdempotencyKey();
    return this.makeRequest<Refund>('POST', '/refunds', payload, idempotencyKey);
  }

  public async getRefund(refundId: string): Promise<Refund> {
    return this.makeRequest<Refund>('GET', `/refunds/${refundId}`);
  }

  public async getPaymentMethods(customerId: string): Promise<{ type: 'array'; items: PaymentMethod[] }> {
    return this.makeRequest<{ type: 'array'; items: PaymentMethod[] }>('GET', `/payment_methods?customer_id=${customerId}`);
  }

  public async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await this.makeRequest<void>('DELETE', `/payment_methods/${paymentMethodId}`);
  }
}