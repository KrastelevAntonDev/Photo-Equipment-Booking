import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserJwtPayload } from '@modules/users/domain/user.entity';
import { normalizePhone } from '@shared/utils/phone.utils';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface GuestUserData {
  clientEmail: string;
  clientPhone: string;
  clientFio: string;
}

/**
 * Middleware для опциональной авторизации
 * Если есть токен - используем его
 * Если нет токена - ожидаем clientEmail, clientPhone, clientFio в body и создаем нового пользователя
 */
export async function optionalAuthMiddleware(
  req: Request & { user?: UserJwtPayload; guestUser?: GuestUserData },
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  // Если есть токен - используем обычную авторизацию
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (typeof decoded === 'object' && decoded !== null) {
        const userPayload = decoded as UserJwtPayload;
        if (userPayload.phone) {
          userPayload.phone = normalizePhone(userPayload.phone);
        }
        req.user = userPayload;
        next();
        return;
      } else {
        res.status(401).json({ message: 'Invalid token payload' });
        return;
      }
    } catch {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  }

  // Если нет токена - проверяем наличие данных гостевого пользователя
  const { clientEmail, clientPhone, clientFio } = req.body;

  if (!clientEmail && !clientPhone && !clientFio) {
    res.status(400).json({ 
      message: 'Требуется авторизация или данные клиента (clientEmail, clientPhone, clientFio)' 
    });
    return;
  }

  // Валидация данных гостевого пользователя
  if (!clientEmail || !clientPhone || !clientFio) {
    res.status(400).json({ 
      message: 'Необходимо указать clientEmail, clientPhone и clientFio' 
    });
    return;
  }

  // Нормализуем телефон
  const normalizedPhone = normalizePhone(clientPhone);

  // Проверяем формат email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clientEmail)) {
    res.status(400).json({ message: 'Неверный формат email' });
    return;
  }

  // Сохраняем данные гостя для дальнейшего использования в контроллере
  req.guestUser = {
    clientEmail,
    clientPhone: normalizedPhone,
    clientFio
  };
  
  next();
}
