// ATOL Online API Types
// Документация: https://integration.atol.ru/

export interface AtolConfig {
  login: string;
  password: string;
  groupCode: string;
  baseUrl: string;
  inn: string;
  paymentAddress: string;
  companyEmail?: string;
}

export enum AtolOperationType {
  Sell = 'sell',           // Приход
  SellRefund = 'sell_refund', // Возврат прихода
  SellCorrection = 'sell_correction' // Коррекция прихода
}

export enum AtolPaymentType {
  Cash = 0,      // Наличными
  Electronically = 1, // Электронными
  Prepaid = 2,   // Предоплата
  Credit = 3,    // Постоплата
  Other = 4      // Иная форма оплаты
}

export enum AtolTaxSystem {
  OSN = 0,  // Общая
  USN_Income = 1, // УСН доход
  USN_IncomeOutcome = 2, // УСН доход-расход
  ENVD = 3, // ЕНВД
  ESN = 4,  // ЕСН
  Patent = 5 // Патент
}

export enum AtolVatType {
  None = 'none',        // Без НДС
  Vat0 = 'vat0',        // НДС 0%
  Vat10 = 'vat10',      // НДС 10%
  Vat20 = 'vat20',      // НДС 20%
  Vat110 = 'vat110',    // НДС 10/110
  Vat120 = 'vat120'     // НДС 20/120
}

export enum AtolPaymentObject {
  Commodity = 'commodity',           // Товар
  Excise = 'excise',                 // Подакцизный товар
  Job = 'job',                       // Работа
  Service = 'service',               // Услуга
  GamblingBet = 'gambling_bet',      // Ставка азартной игры
  GamblingPrize = 'gambling_prize',  // Выигрыш азартной игры
  Lottery = 'lottery',               // Лотерейный билет
  LotteryPrize = 'lottery_prize',    // Выигрыш лотереи
  IntellectualActivity = 'intellectual_activity', // Результаты интеллектуальной деятельности
  Payment = 'payment',               // Платеж
  AgentCommission = 'agent_commission', // Агентское вознаграждение
  Composite = 'composite',           // Составной предмет расчета
  Another = 'another'                // Иной предмет расчета
}

export enum AtolPaymentMethod {
  FullPayment = 'full_payment',           // Полный расчет
  FullPrepayment = 'full_prepayment',     // Предоплата 100%
  Prepayment = 'prepayment',              // Предоплата
  Advance = 'advance',                    // Аванс
  PartialPayment = 'partial_payment',     // Частичный расчет и кредит
  Credit = 'credit',                      // Передача в кредит
  CreditPayment = 'credit_payment'        // Оплата кредита
}

export interface AtolItem {
  name: string;                    // Наименование товара (до 128 символов)
  price: number;                   // Цена за единицу
  quantity: number;                // Количество
  sum: number;                     // Сумма (price * quantity)
  measurement_unit?: string;       // Единица измерения (по умолчанию "шт")
  payment_method: AtolPaymentMethod; // Признак способа расчета
  payment_object: AtolPaymentObject; // Признак предмета расчета
  vat: {
    type: AtolVatType;             // Тип НДС
    sum?: number;                  // Сумма НДС (если применимо)
  };
}

export interface AtolPayment {
  type: AtolPaymentType;           // Тип оплаты
  sum: number;                     // Сумма
}

export interface AtolClient {
  email?: string;                  // Email клиента
  phone?: string;                  // Телефон клиента (+79991234567)
  name?: string;                   // Имя клиента
  inn?: string;                    // ИНН клиента (для юр. лиц)
}

export interface AtolCompany {
  email: string;                   // Email организации
  sno: AtolTaxSystem;              // Система налогообложения
  inn: string;                     // ИНН организации
  payment_address: string;         // Адрес расчетов
}

export interface AtolReceipt {
  client: AtolClient;              // Информация о клиенте
  company: AtolCompany;            // Информация об организации
  items: AtolItem[];               // Товары/услуги
  payments: AtolPayment[];         // Оплата
  total: number;                   // Итоговая сумма
  vats?: Array<{                   // НДС (опционально)
    type: AtolVatType;
    sum: number;
  }>;
}

export interface AtolSellRequest {
  timestamp: string;               // Дата и время документа (ISO 8601)
  external_id: string;             // Уникальный идентификатор (до 128 символов)
  receipt: AtolReceipt;            // Данные чека
  service?: {
    callback_url?: string;         // URL для callback уведомлений
  };
}

export interface AtolTokenResponse {
  code: number;
  text: string;
  token: string;
  error?: {
    code: number;
    text: string;
    type: string;
  };
}

export interface AtolSellResponse {
  uuid: string;                    // UUID чека в АТОЛ
  timestamp: string;               // Время регистрации
  status: 'wait' | 'done' | 'fail'; // Статус
  error?: {
    code: number;
    text: string;
    type: string;
  };
}

export interface AtolReportResponse {
  uuid: string;
  status: 'wait' | 'done' | 'fail';
  error?: {
    code: number;
    text: string;
    type: string;
  };
  payload?: {
    total: number;
    fiscal_receipt_number: number;  // Номер чека
    shift_number: number;           // Номер смены
    receipt_datetime: string;       // Дата и время документа
    fn_number: string;              // Номер ФН
    ecr_registration_number: string; // Регистрационный номер ККТ
    fiscal_document_number: number;  // Номер фискального документа
    fiscal_document_attribute: number; // Фискальный признак
    fns_site: string;               // Адрес сайта ФНС
    ofd_inn: string;                // ИНН ОФД
    ofd_receipt_url?: string;       // Ссылка на чек в ОФД
  };
}
