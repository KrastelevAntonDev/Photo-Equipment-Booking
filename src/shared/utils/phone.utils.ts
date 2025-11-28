/**
 * Нормализует номер телефона в формат +79778256323
 * Удаляет все символы кроме цифр и +, затем приводит к формату +7XXXXXXXXXX
 * 
 * @param phone - номер телефона в любом формате (например: +7 (977) 825-63-23, 8 (977) 825-63-23, 79778256323)
 * @returns нормализованный номер в формате +79778256323 или пустая строка если номер невалидный
 */
export function normalizePhone(phone: string | undefined | null): string {
  if (!phone) {
    return '';
  }

  // Удаляем все символы кроме цифр и +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Если номер начинается с 8, заменяем на 7
  if (cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.substring(1);
  }

  // Если номер начинается с +7, убираем + для дальнейшей обработки
  if (cleaned.startsWith('+7')) {
    cleaned = cleaned.substring(1);
  }

  // Проверяем, что номер начинается с 7 и имеет 11 цифр (7 + 10 цифр)
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    return '+' + cleaned;
  }

  // Если номер уже в правильном формате +7XXXXXXXXXX, возвращаем как есть
  if (phone.startsWith('+7') && cleaned.length === 11) {
    return '+' + cleaned;
  }

  // Если ничего не подошло, возвращаем исходное значение (может быть уже нормализован)
  return phone;
}

