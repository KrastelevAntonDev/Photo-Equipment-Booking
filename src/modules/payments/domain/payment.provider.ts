// Domain-level provider interface. Intentionally does not depend on external API types.
// Concrete providers (e.g., YooKassa) will adapt their specific types under infrastructure/external.

import { CreatePaymentRequest, Payment } from "@/infrastructure/external/yookassa/yookassa.types";

export interface PaymentProvider {
  createPayment(payload: CreatePaymentRequest): Promise<Payment>;
  getPayment(paymentId: string): Promise<unknown>;
  capturePayment(paymentId: string, amount?: { value: string; currency: string }): Promise<unknown>;
  cancelPayment(paymentId: string): Promise<unknown>;

  createRefund(payload: unknown): Promise<unknown>;
  getRefund(refundId: string): Promise<unknown>;

  getPaymentMethods(customerId: string): Promise<unknown>;
  deletePaymentMethod(paymentMethodId: string): Promise<void>;

  getReceipt(receiptId: string): Promise<unknown>;
}

export default PaymentProvider;