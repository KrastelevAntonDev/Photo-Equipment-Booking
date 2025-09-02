
export enum PaymentStatus {
  Pending = 'pending',
  WaitingForCapture = 'waiting_for_capture',
  Succeeded = 'succeeded',
  Canceled = 'canceled',
}

export enum RefundStatus {
  Pending = 'pending',
  Succeeded = 'succeeded',
  Canceled = 'canceled',
}

export enum PaymentMethodType {
  BankCard = 'bank_card',
  YooMoney = 'yoo_money',
  Sberbank = 'sberbank',
  AlfaBank = 'alfabank',
  TinkoffBank = 'tinkoff_bank',
  Qiwi = 'qiwi',
  Webmoney = 'webmoney',
  Psb = 'psb',
  Installments = 'installments',
  B2BPayments = 'b2b_sberbank',
  MobileBalance = 'mobile_balance',
  Cash = 'cash',
  Sbp = 'sbp',
}

export enum ConfirmationType {
  Redirect = 'redirect',
  External = 'external',
  Embedded = 'embedded',
  Qr = 'qr',
}

export enum Currency {
  RUB = 'RUB',
  USD = 'USD',
  EUR = 'EUR',
  // Add more as needed, but RUB is primary
}

export enum WebhookEventType {
  PaymentWaitingForCapture = 'payment.waiting_for_capture',
  PaymentSucceeded = 'payment.succeeded',
  PaymentCanceled = 'payment.canceled',
  RefundSucceeded = 'refund.succeeded',
}

// Interfaces for API objects
export interface Amount {
  value: string; // Decimal string, e.g., "100.00"
  currency: Currency;
}

export interface Confirmation {
  type: ConfirmationType;
  confirmation_url?: string;
  confirmation_token?: string; // For embedded
  return_url?: string;
  enforce?: boolean;
  locale?: string; // e.g., "ru_RU", "en_US"
}

export interface PaymentMethodData {
  type: PaymentMethodType;
  // Type-specific fields
  card_number?: string;
  expiry_month?: string;
  expiry_year?: string;
  csc?: string;
  cardholder?: string;
  // For other types, e.g., phone for mobile_balance, etc.
}

export interface Recipient {
  account_id: string;
  gateway_id: string;
}

export interface PaymentMethod {
  type: PaymentMethodType;
  id: string;
  saved: boolean;
  title?: string;
  // Type-specific
  card?: {
    first6: string;
    last4: string;
    expiry_month: string;
    expiry_year: string;
    card_type: 'Visa' | 'MasterCard' | 'Maestro' | 'Mir' | 'UnionPay' | 'JCB' | 'AmericanExpress' | 'DinersClub' | 'DiscoverCard' | 'InstaPayment' | 'InstaPaymentTM' | 'Laser' | 'Dankort' | 'Unknown';
    issuer_country?: string;
    issuer_name?: string;
  };
  login?: string; // For yoo_money, alfabank, etc.
  phone?: string; // For mobile_balance
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  amount: Amount;
  income_amount?: Amount;
  description?: string;
  recipient: Recipient;
  payment_method?: PaymentMethod;
  captured_at?: string; // ISO 8601
  created_at: string; // ISO 8601
  expires_at?: string;
  confirmation?: Confirmation;
  test: boolean;
  refunded_amount?: Amount;
  paid: boolean;
  refundable: boolean;
  receipt_registration?: 'pending' | 'succeeded' | 'canceled';
  metadata?: Record<string, string>;
  cancellation_details?: {
    party: 'yookassa' | 'merchant' | 'payment_network';
    reason: string;
  };
  authorization_details?: {
    rrn?: string;
    auth_code?: string;
    three_d_secure?: {
      applied: boolean;
      protocol?: string;
      method?: string;
    };
  };
  transfers?: Transfer[];
  deal?: Deal;
  merchant_customer_id?: string;
}

export interface Refund {
  id: string;
  payment_id: string;
  status: RefundStatus;
  amount: Amount;
  created_at: string; // ISO 8601
  description?: string;
  receipt_registration?: 'pending' | 'succeeded' | 'canceled';
  sources?: Source[];
  cancellation_details?: {
    party: 'yookassa' | 'merchant' | 'payment_network';
    reason: string;
  };
}

export interface Source {
  account_id: string;
  amount: Amount;
  platform_fee_amount?: Amount;
}

export interface CreatePaymentRequest {
  amount: Amount;
  confirmation?: Confirmation;
  capture?: boolean;
  description?: string;
  metadata?: Record<string, string>;
  receipt?: Receipt;
  recipient?: Recipient;
  payment_method_data?: PaymentMethodData;
  payment_method_id?: string;
  save_payment_method?: boolean;
  airline?: Airline;
  transfers?: Transfer[];
  deal?: {
    id: string;
  };
  merchant_customer_id?: string;
}

export interface CreateRefundRequest {
  amount: Amount;
  payment_id: string;
  description?: string;
  receipt?: Receipt;
  sources?: Source[];
}

export interface Receipt {
  customer: {
    full_name?: string;
    inn?: string;
    email?: string;
    phone?: string;
  };
  items: ReceiptItem[];
  tax_system_code?: 1 | 2 | 3 | 4 | 5 | 6;
  settlements?: Settlement[];
  on_behalf_of?: string;
}

export interface ReceiptItem {
  description: string;
  quantity: string; // Decimal string
  amount: Amount;
  vat_code: 1 | 2 | 3 | 4 | 5 | 6;
  payment_subject: 'commodity' | 'excise' | 'job' | 'service' | 'gambling_bet' | 'gambling_prize' | 'lottery' | 'lottery_prize' | 'intellectual_activity' | 'payment' | 'agent_commission' | 'composite' | 'another';
  payment_mode: 'full_prepayment' | 'prepayment' | 'advance' | 'full_payment' | 'partial_payment' | 'credit' | 'credit_payment';
  country_of_origin_code?: string; // ISO 3166-1 alpha-2
  customs_declaration_number?: string;
  excise?: string; // Decimal string
  product_code?: string;
  measure?: string;
  supplier?: Supplier;
  agent_info?: AgentInfo;
  mark_code_info?: MarkCodeInfo;
  mark_quantity?: MarkQuantity;
  mark_mode?: '0' | '1';
}

export interface Supplier {
  name: string;
  phone?: string;
  inn: string;
}

export interface AgentInfo {
  type: 'bank_paying_agent' | 'bank_paying_subagent' | 'paying_agent' | 'paying_subagent' | 'attorney' | 'commissioner' | 'agent';
  // Type-specific fields
  operation?: string;
  phones?: string[];
}

export interface MarkCodeInfo {
  mark_code_raw?: string;
  ean_8?: string;
  ean_13?: string;
  itf_14?: string;
  gs_10?: string;
  gs_1m?: string;
  short?: string;
  fur?: string;
  egais_20?: string;
  egais_30?: string;
  unknown?: string;
}

export interface MarkQuantity {
  numerator?: number;
  denominator?: number;
}

export interface Settlement {
  type: 'cashless' | 'prepayment' | 'postpayment' | 'consideration';
  amount: Amount;
}

export interface Airline {
  ticket_number: string;
  booking_reference: string;
  passengers: Passenger[];
  legs: Leg[];
}

export interface Passenger {
  first_name: string;
  last_name: string;
}

export interface Leg {
  departure_airport: string;
  destination_airport: string;
  departure_date: string; // YYYY-MM-DD
  carrier_code?: string;
}

export interface Transfer {
  account_id: string;
  amount: Amount;
  status?: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  platform_fee_amount?: Amount;
  description?: string;
  metadata?: Record<string, string>;
}

export interface Deal {
  id: string;
  settlements: DealSettlement[];
}

export interface DealSettlement {
  type: 'payout';
  amount: Amount;
}

export interface WebhookNotification {
  type: 'notification';
  event: WebhookEventType;
  object: Payment | Refund;
}

export interface ApiError {
  type: 'error';
  id: string;
  code: string;
  description: string;
  parameter?: string;
}