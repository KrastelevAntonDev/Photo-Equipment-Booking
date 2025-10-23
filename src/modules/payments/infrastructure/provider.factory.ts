import { env } from '@config/env';
import { PaymentProvider } from '@modules/payments/domain/payment.provider';
import { YooKassaProvider } from './providers/yookassa.provider';

export function createPaymentProvider(): PaymentProvider {
  const { SHOP_ID, SECRET_KEY } = env;
  if (!SHOP_ID || !SECRET_KEY) {
    throw new Error('Missing SHOP_ID or SECRET_KEY in environment configuration');
  }
  return new YooKassaProvider(SHOP_ID, SECRET_KEY);
}

export default createPaymentProvider;