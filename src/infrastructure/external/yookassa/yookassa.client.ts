import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import {
  Amount,
  CreatePaymentRequest,
  CreateRefundRequest,
  Payment,
  Refund,
  ApiError,
  PaymentMethod,
} from './yookassa.types';

export class YooKassaHttpClient {
  private readonly baseUrl: string = 'https://api.yookassa.ru/v3';
  private readonly basicAuth: string;
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly shopId: string, private readonly secretKey: string) {
    if (!shopId || !secretKey) {
      throw new Error('Shop ID and Secret Key are required');
    }
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

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
    idempotencyKey?: string,
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      if (idempotencyKey) headers['Idempotence-Key'] = idempotencyKey;

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

  // Payments
  async createPayment(payload: CreatePaymentRequest): Promise<Payment> {
    const key = this.generateIdempotencyKey();
    return this.request<Payment>('POST', '/payments', payload, key);
  }

  async getPayment(paymentId: string): Promise<Payment> {
    return this.request<Payment>('GET', `/payments/${paymentId}`);
  }

  async capturePayment(paymentId: string, amount?: Amount): Promise<Payment> {
    const key = this.generateIdempotencyKey();
    const body = amount ? { amount } : undefined;
    return this.request<Payment>('POST', `/payments/${paymentId}/capture`, body, key);
  }

  async cancelPayment(paymentId: string): Promise<Payment> {
    const key = this.generateIdempotencyKey();
    return this.request<Payment>('POST', `/payments/${paymentId}/cancel`, undefined, key);
  }

  // Refunds
  async createRefund(payload: CreateRefundRequest): Promise<Refund> {
    const key = this.generateIdempotencyKey();
    return this.request<Refund>('POST', '/refunds', payload, key);
  }

  async getRefund(refundId: string): Promise<Refund> {
    return this.request<Refund>('GET', `/refunds/${refundId}`);
  }

  // Payment methods
  async getPaymentMethods(customerId: string): Promise<{ type: 'array'; items: PaymentMethod[] }> {
    return this.request<{ type: 'array'; items: PaymentMethod[] }>('GET', `/payment_methods?customer_id=${customerId}`);
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await this.request<void>('DELETE', `/payment_methods/${paymentMethodId}`);
  }
}
