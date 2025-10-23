import { YooKassaHttpClient } from '@infrastructure/external/yookassa/yookassa.client';
import { Amount, CreatePaymentRequest, CreateRefundRequest, Payment, Refund, PaymentMethod } from '@infrastructure/external/yookassa/yookassa.types';
import { PaymentProvider } from '../../domain/payment.provider';

export class YooKassaProvider implements PaymentProvider {
  private readonly client: YooKassaHttpClient;

  constructor(shopId: string, secretKey: string) {
    this.client = new YooKassaHttpClient(shopId, secretKey);
  }

  // Delegate methods to HTTP client
  createPayment(payload: CreatePaymentRequest): Promise<Payment> {
    return this.client.createPayment(payload);
  }

  getPayment(paymentId: string): Promise<Payment> {
    return this.client.getPayment(paymentId);
  }

  capturePayment(paymentId: string, amount?: Amount): Promise<Payment> {
    return this.client.capturePayment(paymentId, amount);
  }

  cancelPayment(paymentId: string): Promise<Payment> {
    return this.client.cancelPayment(paymentId);
  }

  createRefund(payload: CreateRefundRequest): Promise<Refund> {
    return this.client.createRefund(payload);
  }

  getRefund(refundId: string): Promise<Refund> {
    return this.client.getRefund(refundId);
  }

  getPaymentMethods(customerId: string): Promise<{ type: 'array'; items: PaymentMethod[] }> {
    return this.client.getPaymentMethods(customerId);
  }

  deletePaymentMethod(paymentMethodId: string): Promise<void> {
    return this.client.deletePaymentMethod(paymentMethodId);
  }
}
