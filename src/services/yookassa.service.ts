import * as https from 'https';
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

  constructor(shopId: string, secretKey: string) {
    if (!shopId || !secretKey) {
      throw new Error('Shop ID and Secret Key are required');
    }
    this.shopId = shopId;
    this.secretKey = secretKey;
    this.basicAuth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');
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
    const url = `${this.baseUrl}${path}`;
    const data = body ? JSON.stringify(body) : undefined;
    const headers: Record<string, string> = {
      Authorization: `Basic ${this.basicAuth}`,
      'Content-Type': 'application/json',
    };

    if (idempotencyKey) {
      headers['Idempotence-Key'] = idempotencyKey;
    }

    if (data) {
      headers['Content-Length'] = Buffer.byteLength(data).toString();
    }

    return new Promise((resolve, reject) => {
      const req = https.request(
        url,
        {
          method,
          headers,
        },
        (res) => {
          let responseBody = '';
          res.on('data', (chunk) => {
            responseBody += chunk;
          });
          res.on('end', () => {
            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
              try {
                const error = JSON.parse(responseBody) as ApiError;
                reject(new Error(`${error.code}: ${error.description}`));
              } catch {
                reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
              }
            } else {
              try {
                const parsed = responseBody ? JSON.parse(responseBody) as T : {} as T;
                resolve(parsed);
              } catch (err) {
                reject(err);
              }
            }
          });
        },
      );

      req.on('error', reject);

      if (data) {
        req.write(data);
      }
      req.end();
    });
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

  // Additional endpoints if needed, e.g., for payment methods
  public async getPaymentMethods(customerId: string): Promise<{ type: 'array'; items: PaymentMethod[] }> {
    return this.makeRequest<{ type: 'array'; items: PaymentMethod[] }>('GET', `/payment_methods?customer_id=${customerId}`);
  }

  public async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await this.makeRequest<void>('DELETE', `/payment_methods/${paymentMethodId}`);
  }

  // For webhooks, validation can be added if YooKassa provides signature, but currently they don't; rely on IP and secret in URL if needed
}