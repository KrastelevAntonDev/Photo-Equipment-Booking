import { ReceiptResponse } from '@infrastructure/external/yookassa/yookassa.types';

/**
 * Формирует ссылку на чек в 1-OFD на основе данных чека
 * @param receipt - Данные чека от ЮKassa
 * @returns URL чека в формате 1-OFD или null если недостаточно данных
 * 
 * Пример: https://consumer.1-ofd.ru/ticket?t=20251027T0050&s=10.0&fn=7380440902539109&i=14005&fp=1558995940&n=1
 * 
 * Параметры:
 * - t: дата и время (yyyyMMddTHHmm)
 * - s: сумма (amount)
 * - fn: номер фискального накопителя (fiscal_storage_number)
 * - i: номер фискального документа (fiscal_document_number)
 * - fp: фискальный признак (fiscal_attribute)
 * - n: тип чека (1 - приход, 2 - возврат прихода)
 */
export function buildReceiptUrl(receipt: ReceiptResponse): string | null {
  try {
    // Проверяем наличие всех необходимых данных
    if (!receipt.registered_at || 
        !receipt.fiscal_storage_number || 
        !receipt.fiscal_document_number || 
        !receipt.fiscal_attribute ||
        !receipt.items || 
        receipt.items.length === 0) {
      return null;
    }

    // Форматируем дату: 2025-10-27T00:50:00.000Z -> 20251027T0050
    const date = new Date(receipt.registered_at);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}T${hours}${minutes}`;

    // Рассчитываем общую сумму из items
    const totalAmount = receipt.items.reduce((sum, item) => {
      return sum + (parseFloat(item.amount.value) || 0);
    }, 0);

    // Определяем тип чека: payment = 1 (приход), refund = 2 (возврат)
    const receiptType = receipt.type === 'refund' ? '2' : '1';

    // Формируем URL
    const params = new URLSearchParams({
      t: formattedDate,
      s: totalAmount.toFixed(2),
      fn: receipt.fiscal_storage_number,
      i: receipt.fiscal_document_number,
      fp: receipt.fiscal_attribute,
      n: receiptType
    });

    return `https://consumer.1-ofd.ru/ticket?${params.toString()}`;
  } catch (error) {
    console.error('Error building receipt URL:', error);
    return null;
  }
}

/**
 * Получает короткую ссылку на чек для использования в SMS
 * Можно позже добавить интеграцию с сервисом сокращения ссылок
 */
export function getShortReceiptUrl(receipt: ReceiptResponse): string | null {
  const fullUrl = buildReceiptUrl(receipt);
  // TODO: интегрировать с сервисом сокращения ссылок (например, clck.ru или bitly)
  return fullUrl;
}
