import { OpenAPIV3_1 } from 'openapi-types';

// Базовая спецификация OpenAPI. При желании можно расширять/генерировать из JSDoc.
export const openapiSpec: OpenAPIV3_1.Document = {
  openapi: '3.1.0',
  info: {
    title: 'Photo Equipment Booking API',
    version: '1.0.0',
    description: 'API для бронирования студий и оборудования',
  },
  servers: [
    { url: '/', description: 'Current server (relative)' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RoomPricing: {
        type: 'object',
        properties: {
          weekday_00_12: { type: 'number' },
          weekday_12_24: { type: 'number' },
          weekend_holiday_00_24: { type: 'number' },
        },
      },
      Room: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          address: { type: 'string' },
          area: { type: 'number' },
          pricePerHour: { type: 'number' },
          category: { type: 'string' },
          minBookingHours: { type: 'number' },
          ceilingHeightMeters: { type: 'number' },
          features: { type: 'array', items: { type: 'string' } },
          sharedSpace: { type: 'boolean' },
          cycWall: { type: 'boolean' },
          hasMakeupTable: { type: 'boolean' },
          noPassSystem: { type: 'boolean' },
          pricing: { $ref: '#/components/schemas/RoomPricing' },
          colorScheme: { type: 'array', items: { type: 'string' } },
          styles: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          isAvailable: { type: 'boolean', description: 'Флаг доступности зала. Если false - зал не отображается в публичном API (/rooms), но виден в админке (/admin/rooms)' },
          availableFrom: { type: 'string', format: 'date-time', description: 'Дата начала работы зала' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          isDeleted: { type: 'boolean' },
        },
      },
      // DTOs
      LoginDTO: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      RegisterDTO: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          phone: { type: 'string' },
          fullName: { type: 'string', description: 'ФИО пользователя' },
        },
      },
      BookingEquipment: {
        type: 'object',
        required: ['equipmentId', 'quantity'],
        properties: {
          equipmentId: { type: 'string', description: 'ID оборудования (ObjectId)' },
          quantity: { type: 'number', minimum: 1, description: 'Количество единиц оборудования' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          roomId: { type: 'string' },
          equipmentIds: { type: 'array', items: { type: 'string' }, description: 'Устаревший формат: список ID оборудования без количества' },
          equipment: { 
            type: 'array', 
            items: { $ref: '#/components/schemas/BookingEquipment' },
            description: 'Новый формат: оборудование с указанием количества'
          },
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
          totalPrice: { type: 'number', description: 'Итоговая цена (с учётом скидки)' },
          originalPrice: { type: 'number', description: 'Исходная цена до применения промокода' },
          discount: { type: 'number', description: 'Размер скидки' },
          promocode: { type: 'string', description: 'Использованный промокод' },
          promocodeId: { type: 'string', description: 'ID промокода' },
          paymentMethod: { type: 'string', enum: ['online', 'on_site_cash', 'on_site_card'] },
          isPaid: { type: 'boolean' },
          paidAmount: { type: 'number' },
          paymentStatus: { type: 'string', enum: ['unpaid', 'partial', 'paid'] },
          isHalfPaid: { type: 'boolean', description: 'Признак половинной оплаты (45%-55% от total)' },
          type: { type: 'string', enum: ['photo', 'video', 'event'], description: 'Тип съёмки' },
          people: { type: 'string', enum: ['up-to-10', 'more-than-10', 'more-than-20', 'more-than-50'], description: 'Количество человек' },
          bookingPaymentMethod: { type: 'string', enum: ['card-50', 'card-full', 'invoice'], description: 'Способ оплаты из формы бронирования' },
          services: { type: 'array', items: { type: 'string' }, description: 'Дополнительные услуги (ID)' },
          entityType: { type: 'string', enum: ['individual', 'company'], description: 'Тип клиента' },
          user: {
            type: 'object',
            description: 'Данные пользователя (для отображения без джоина)',
            properties: {
              userId: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              fullName: { type: 'string' },
              iat: { type: 'number' },
              exp: { type: 'number' },
            }
          },
          notificationsSent: {
            type: 'array',
            items: { type: 'string' },
            description: 'Типы отправленных уведомлений',
          },
          cancelledAt: { type: 'string', format: 'date-time', description: 'Время автоматической отмены' },
          cancellationReason: { type: 'string', description: 'Причина отмены бронирования' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          isDeleted: { type: 'boolean' },
        },
      },
      CreateBookingDTO: {
        type: 'object',
        required: ['roomId', 'start', 'end', 'type', 'people', 'paymentMethod', 'entityType'],
        properties: {
          clientEmail: { type: 'string', format: 'email', description: 'Email клиента (обязательно если нет токена авторизации)' },
          clientPhone: { type: 'string', description: 'Телефон клиента в формате +7XXXXXXXXXX (обязательно если нет токена)' },
          clientFio: { type: 'string', description: 'ФИО клиента (обязательно если нет токена)' },
          roomId: { type: 'string', description: 'ID студии' },
          start: { type: 'string', format: 'date-time', description: 'Дата и время начала бронирования' },
          end: { type: 'string', format: 'date-time', description: 'Дата и время окончания бронирования' },
          type: { type: 'string', enum: ['photo', 'video', 'event'], description: 'Тип съёмки' },
          people: { type: 'string', enum: ['up-to-10', 'more-than-10', 'more-than-20', 'more-than-50'], description: 'Количество человек' },
          paymentMethod: { type: 'string', enum: ['card-50', 'card-full', 'invoice'], description: 'Способ оплаты' },
          entityType: { type: 'string', enum: ['individual', 'company'], description: 'Тип клиента' },
          services: { type: 'array', items: { type: 'string' }, description: 'Массив ID дополнительных услуг' },
          equipmentIds: { type: 'array', items: { type: 'string' }, description: 'Устаревший формат: список ID оборудования (будет автоматически преобразован в equipment с quantity=1)' },
          equipment: { 
            type: 'array', 
            items: { $ref: '#/components/schemas/BookingEquipment' },
            description: 'Новый формат: оборудование с указанием количества. Если указан, то equipmentIds игнорируется'
          },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'], description: 'Статус бронирования (опционально)' },
          promocode: { type: 'string', description: 'Промокод для получения скидки' },
        },
        example: {
          clientEmail: 'client@example.com',
          clientPhone: '+79261234567',
          clientFio: 'Иван Петров',
          roomId: '507f1f77bcf86cd799439011',
          start: '2025-12-20T10:00:00.000Z',
          end: '2025-12-20T18:00:00.000Z',
          type: 'photo',
          people: 'up-to-10',
          paymentMethod: 'card-50',
          entityType: 'individual',
          services: [],
          equipmentIds: [],
          promocode: 'DISCOUNT10'
        }
      },
      UpdateBookingDTO: {
        type: 'object',
        properties: {
          roomId: { type: 'string', description: 'ID студии' },
          equipmentIds: { type: 'array', items: { type: 'string' }, description: 'Устаревший формат: список ID оборудования' },
          equipment: { 
            type: 'array', 
            items: { $ref: '#/components/schemas/BookingEquipment' },
            description: 'Новый формат: оборудование с указанием количества'
          },
          start: { type: 'string', format: 'date-time', description: 'Дата и время начала' },
          end: { type: 'string', format: 'date-time', description: 'Дата и время окончания' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'], description: 'Статус бронирования' },
          totalPrice: { type: 'number', description: 'Итоговая цена' },
          paymentMethod: { type: 'string', enum: ['online', 'on_site_cash', 'on_site_card'], description: 'Способ оплаты' },
          isPaid: { type: 'boolean', description: 'Оплачено ли' },
          isHalfPaid: { type: 'boolean', description: 'Признак половинной оплаты (45%-55% от total)' },
        },
      },
      AdminCreateBookingDTO: {
        type: 'object',
        required: ['userId', 'roomId', 'start', 'end', 'paymentMethod'],
        properties: {
          userId: { type: 'string', description: 'ID пользователя, для которого создаётся бронирование' },
          roomId: { type: 'string', description: 'ID студии' },
          equipmentIds: { type: 'array', items: { type: 'string' }, description: 'Устаревший формат: список ID оборудования (будет автоматически преобразован в equipment с quantity=1)' },
          equipment: { 
            type: 'array', 
            items: { $ref: '#/components/schemas/BookingEquipment' },
            description: 'Новый формат: оборудование с указанием количества. Если указан, то equipmentIds игнорируется'
          },
          start: { type: 'string', format: 'date-time', description: 'Дата и время начала бронирования' },
          end: { type: 'string', format: 'date-time', description: 'Дата и время окончания бронирования' },
          totalPrice: { type: 'number', description: 'Общая стоимость (опционально, если не указана - рассчитается автоматически)' },
          paymentMethod: { type: 'string', enum: ['on_site_cash', 'on_site_card'], description: 'Способ оплаты' },
        },
        example: {
          userId: '507f1f77bcf86cd799439012',
          roomId: '507f1f77bcf86cd799439011',
          equipment: [
            { equipmentId: '507f191e810c19729de860ea', quantity: 3 },
            { equipmentId: '507f191e810c19729de860eb', quantity: 1 }
          ],
          start: '2024-03-25T09:00:00.000Z',
          end: '2024-03-25T18:00:00.000Z',
          paymentMethod: 'on_site_card'
        }
      },
      CreateFormDTO: {
        type: 'object',
        required: ['name', 'phone', 'servicesType', 'textarea', 'checkbox', 'formType'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          servicesType: { type: 'string' },
          textarea: { type: 'string' },
          checkbox: { type: 'boolean' },
          formType: { type: 'string', enum: ['contact', 'booking_food', 'feedback'] },
        },
      },
      // Promocodes
      Promocode: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          code: { type: 'string', description: 'Уникальный код промокода' },
          discountAmount: { type: 'number', description: 'Сумма скидки в рублях' },
          isActive: { type: 'boolean', description: 'Активен ли промокод' },
          expiresAt: { type: 'string', format: 'date-time', description: 'Дата истечения' },
          usageLimit: { type: 'number', description: 'Максимальное количество использований' },
          usedCount: { type: 'number', description: 'Сколько раз использован' },
          description: { type: 'string', description: 'Описание промокода' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreatePromocodeDTO: {
        type: 'object',
        required: ['code', 'discountAmount'],
        properties: {
          code: { type: 'string', description: 'Код промокода' },
          discountAmount: { type: 'number', minimum: 0, description: 'Сумма скидки в рублях' },
          isActive: { type: 'boolean', description: 'Активен ли промокод', default: true },
          expiresAt: { type: 'string', format: 'date-time', description: 'Дата истечения' },
          usageLimit: { type: 'number', minimum: 1, description: 'Максимальное количество использований' },
          description: { type: 'string', description: 'Описание промокода' },
        },
      },
      UpdatePromocodeDTO: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Код промокода' },
          discountAmount: { type: 'number', minimum: 0, description: 'Сумма скидки в рублях' },
          isActive: { type: 'boolean', description: 'Активен ли промокод' },
          expiresAt: { type: 'string', format: 'date-time', description: 'Дата истечения' },
          usageLimit: { type: 'number', minimum: 1, description: 'Максимальное количество использований' },
          description: { type: 'string', description: 'Описание промокода' },
        },
      },
      ValidatePromocodeDTO: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string', description: 'Код промокода для проверки' },
        },
      },
      CreateUserDTO: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string', description: 'ФИО пользователя' },
        },
      },
      AdminCreateUserDTO: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          fullName: { type: 'string', description: 'ФИО пользователя' },
        },
      },
      AdminUpdateUserDTO: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', description: 'Email пользователя' },
          phone: { type: 'string', description: 'Телефон пользователя' },
          fullName: { type: 'string', description: 'ФИО пользователя' },
          balance: { type: 'number', minimum: 0, description: 'Баланс пользователя' },
          points: { type: 'number', minimum: 0, description: 'Бонусные баллы' },
        },
      },
      // ATOL Schemas
      CreateReceiptDTO: {
        type: 'object',
        required: ['bookingId', 'paymentType'],
        properties: {
          bookingId: { type: 'string', description: 'ID бронирования' },
          paymentType: { type: 'string', enum: ['cash', 'card'], description: 'Способ оплаты' },
        },
      },
      Receipt: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          bookingId: { type: 'string' },
          paymentId: { type: 'string' },
          externalId: { type: 'string', description: 'Внешний ID для АТОЛ' },
          atolUuid: { type: 'string', description: 'UUID чека в АТОЛ' },
          status: { type: 'string', enum: ['wait', 'done', 'fail'], description: 'Статус чека' },
          paymentType: { type: 'string', enum: ['cash', 'card'] },
          totalAmount: { type: 'number' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'number' },
              },
            },
          },
          customerEmail: { type: 'string' },
          customerPhone: { type: 'string' },
          customerName: { type: 'string' },
          fiscalData: {
            type: 'object',
            description: 'Данные после фискализации',
            properties: {
              fiscalReceiptNumber: { type: 'number' },
              shiftNumber: { type: 'number' },
              receiptDatetime: { type: 'string' },
              fnNumber: { type: 'string' },
              ecrRegistrationNumber: { type: 'string' },
              fiscalDocumentNumber: { type: 'number' },
              fiscalDocumentAttribute: { type: 'number' },
              fnsSite: { type: 'string' },
              ofdInn: { type: 'string' },
              ofdReceiptUrl: { type: 'string' },
            },
          },
          error: { type: 'string', description: 'Ошибка, если есть' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PaymentCreateRequest: {
        type: 'object',
        required: ['bookingId'],
        properties: {
          bookingId: { type: 'string' },
          capture: { type: 'boolean' },
          description: { type: 'string' },
          return_url: { type: 'string' },
          method: { type: 'string', enum: ['online', 'on_site_cash', 'on_site_card'] },
          paymentOption: { type: 'string', enum: ['full', 'half'], description: 'Размер оплаты при онлайн-платеже: 100% или 50%' },
        },
      },
      AdminCreatePaymentDTO: {
        type: 'object',
        required: ['bookingId', 'discountAmount'],
        properties: {
          bookingId: { type: 'string', description: 'ID бронирования' },
          discountAmount: { type: 'number', minimum: 0, description: 'Размер скидки в рублях' },
          discountReason: { type: 'string', description: 'Причина предоставления скидки' },
          return_url: { type: 'string', description: 'URL для возврата после оплаты' },
        },
      },
      // Equipment
      CreateEquipmentDTO: {
        type: 'object',
        required: ['name', 'pricePerHour'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          pricePerHour: { type: 'number' },
          image: { type: 'string' },
        },
      },
      UpdateEquipmentDTO: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Название оборудования' },
          description: { type: 'string', description: 'Описание оборудования' },
          pricePerHour: { type: 'number', description: 'Цена за час аренды' },
          image: { type: 'string', description: 'URL основного изображения (устаревшее поле)' },
          images: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Массив URL изображений в нужном порядке. Позволяет администратору управлять порядком отображения фотографий'
          },
          totalQuantity: { type: 'number', minimum: 0, description: 'Общее количество единиц оборудования в наличии' },
        },
      },
      Equipment: {
        type: 'object',
        properties: {
          _id: { type: 'string', description: 'ObjectId' },
          name: { type: 'string', description: 'Название оборудования' },
          description: { type: 'string', description: 'Описание оборудования' },
          pricePerDay: { type: 'number', description: 'Цена за сутки (24 часа). Не зависит от длительности бронирования - пользователь платит полную дневную стоимость даже при аренде на 1-2 часа' },
          image: { type: 'string', description: 'URL основного изображения (устаревшее поле)' },
          images: { type: 'array', items: { type: 'string' }, description: 'Массив URLs изображений в определённом порядке' },
          totalQuantity: { type: 'number', minimum: 0, description: 'Общее количество единиц оборудования в наличии' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          isDeleted: { type: 'boolean', description: 'Флаг мягкого удаления' },
        },
      },
      // Rooms
      CreateRoomDTO: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          address: { type: 'string' },
          area: { type: 'number' },
          pricePerHour: { type: 'number' },
          category: { type: 'string' },
          minBookingHours: { type: 'number' },
          ceilingHeightMeters: { type: 'number' },
          features: { type: 'array', items: { type: 'string' } },
          sharedSpace: { type: 'boolean' },
          cycWall: { type: 'boolean' },
          hasMakeupTable: { type: 'boolean' },
          noPassSystem: { type: 'boolean' },
          pricing: { $ref: '#/components/schemas/RoomPricing' },
          colorScheme: { type: 'array', items: { type: 'string' } },
          styles: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          isAvailable: { type: 'boolean', description: 'Флаг доступности зала' },
          availableFrom: { type: 'string', format: 'date-time', description: 'Дата начала работы зала' },
        },
      },
      UpdateRoomDTO: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Название студии' },
          address: { type: 'string', description: 'Адрес студии' },
          area: { type: 'number', description: 'Площадь в кв. метрах' },
          pricePerHour: { type: 'number', description: 'Базовая цена за час' },
          category: { type: 'string', description: 'Категория студии' },
          minBookingHours: { type: 'number', description: 'Минимальное количество часов для бронирования' },
          ceilingHeightMeters: { type: 'number', description: 'Высота потолков в метрах' },
          features: { type: 'array', items: { type: 'string' }, description: 'Особенности студии' },
          sharedSpace: { type: 'boolean', description: 'Общее пространство' },
          cycWall: { type: 'boolean', description: 'Наличие циклорамы' },
          hasMakeupTable: { type: 'boolean', description: 'Наличие гримёрного стола' },
          noPassSystem: { type: 'boolean', description: 'Отсутствие пропускной системы' },
          pricing: { $ref: '#/components/schemas/RoomPricing', description: 'Дифференцированное ценообразование' },
          colorScheme: { type: 'array', items: { type: 'string' }, description: 'Цветовая схема интерьера' },
          styles: { type: 'array', items: { type: 'string' }, description: 'Стили интерьера' },
          description: { type: 'string', description: 'Описание студии' },
          images: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Массив URL изображений в нужном порядке. Позволяет администратору управлять порядком отображения фотографий студии'
          },
          isAvailable: { type: 'boolean', description: 'Флаг доступности зала для отображения' },
          availableFrom: { type: 'string', format: 'date-time', description: 'Дата начала работы зала' },
        },
      },
      // Notifications
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          bookingId: { type: 'string', description: 'ID бронирования' },
          userId: { type: 'string', description: 'ID пользователя' },
          type: {
            type: 'string',
            enum: [
              'payment_warning_1h',
              'payment_cancelled_2h',
              'payment_full_confirmed',
              'payment_half_confirmed',
              'reminder_24h_full_paid',
              'reminder_24h_half_paid',
            ],
            description: 'Тип уведомления',
          },
          status: {
            type: 'string',
            enum: ['pending', 'scheduled', 'processing', 'sent', 'failed', 'cancelled'],
            description: 'Статус отправки',
          },
          priority: { type: 'number', description: 'Приоритет (1-20)' },
          phoneNumber: { type: 'string', description: 'Номер телефона получателя' },
          message: { type: 'string', description: 'Текст сообщения' },
          scheduledFor: { type: 'string', format: 'date-time', description: 'Время запланированной отправки' },
          sentAt: { type: 'string', format: 'date-time', description: 'Время фактической отправки' },
          attempts: { type: 'number', description: 'Количество попыток' },
          maxAttempts: { type: 'number', description: 'Максимум попыток' },
          lastError: { type: 'string', description: 'Последняя ошибка' },
          jobId: { type: 'string', description: 'ID задачи в Bull Queue' },
          metadata: { type: 'object', description: 'Дополнительные данные' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      // SMS
      SmsViberParametersDTO: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { type: 'string', enum: ['text', 'link', 'phone'], description: 'Тип Viber сообщения' },
          btnText: { type: 'string', description: 'Текст кнопки' },
          btnLink: { type: 'string', description: 'Ссылка кнопки' },
          btnPhone: { type: 'string', description: 'Номер кнопки' },
          imageHash: { type: 'string', description: 'Хэш загруженной картинки' },
          smsLifetime: { type: 'integer', description: 'Время жизни сообщения (мс)' },
        },
      },
      SmsVkParametersDTO: {
        type: 'object',
        required: ['templateId', 'tmpl_data'],
        properties: {
          templateId: { type: 'integer', description: 'ID шаблона ВК' },
          tmpl_data: { type: 'string', description: 'JSON строка переменных шаблона' },
          userId: { type: 'integer' },
          pushToken: { type: 'string' },
          pushApp: { type: 'string' },
          pushEncrypt: { type: 'integer', enum: [0, 1] },
          userIp: { type: 'string' },
          ttl: { type: 'integer', description: 'Время жизни (сек)' },
          issueTime: { type: 'integer', description: 'Unix timestamp создания' },
        },
      },
      SmsWaParametersDTO: {
        type: 'object',
        required: ['template', 'language'],
        properties: {
          template: { type: 'string', description: 'Название WhatsApp шаблона' },
          language: { type: 'string', description: 'Язык (ru, en и т.д.)' },
        },
      },
      SmsItemDTO: {
        type: 'object',
        required: ['phone', 'channel'],
        properties: {
          phone: { type: 'string', maxLength: 11, description: 'Номер без + (11 цифр)' },
          text: { type: 'string', description: 'Текст сообщения' },
          link: { type: 'string', description: 'Ссылка для подстановки #shorturl#' },
          linkTtl: { type: 'integer', description: 'Срок жизни ссылки (мин)' },
          channel: { type: 'string', enum: ['digit', 'char', 'viber', 'vk', 'whatsapp', 'ww', 'zip', 'telegram', 'auth', 'ping', 'hit'], description: 'Канал' },
          sender: { type: 'string', description: 'Имя отправителя (для char, viber и пр.)' },
          plannedAt: { type: 'integer', description: 'Unix timestamp отложенной отправки' },
          viberParameters: { $ref: '#/components/schemas/SmsViberParametersDTO' },
          vkParameters: { $ref: '#/components/schemas/SmsVkParametersDTO' },
          header: { type: 'object', properties: { text: { type: 'string' } }, description: 'Заголовок для WhatsApp' },
          waParameters: { $ref: '#/components/schemas/SmsWaParametersDTO' },
          cascadeSchemeId: { type: 'integer', description: 'ID схемы каскадных сообщений' },
          tag: { type: 'string', maxLength: 20, description: 'Тег для сортировки' },
          randomizer: { type: 'integer', enum: [0, 1], description: 'Рандомизация текста' },
          randomizerOptions: { type: 'object', properties: { translate: { type: 'integer', enum: [0, 1] }, locked: { type: 'array', items: { type: 'string' } } } },
        },
      },
      SendSmsDTO: {
        type: 'object',
        required: ['sms'],
        properties: {
          webhookUrl: { type: 'string', description: 'URL для webhook статусов' },
          sms: { type: 'array', items: { $ref: '#/components/schemas/SmsItemDTO' }, maxItems: 1000 },
        },
      },
      SmsStatusItem: {
        type: 'object',
        properties: {
          sms_id: { type: 'integer' },
          sms_status: { type: 'string', enum: ['created', 'moderation', 'sent', 'error', 'delivered', 'not_delivered', 'read', 'planned', 'low_balance', 'low_partner_balance', 'rejected'] },
          receive_date: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
        },
      },
      SmsInfoResponse: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          data: { 
            type: 'array', 
            items: { 
              type: 'object', 
              properties: {
                id: { type: 'integer' },
                errorDescription: { type: 'string' },
                cost: { type: 'string' },
                createdAt: { type: 'integer' },
                updatedAt: { type: 'integer' },
                cascadeSmsId: { type: 'integer' },
                status: { type: 'string' },
              } 
            } 
          },
        },
      },
    },
  },
  tags: [
    { name: 'Auth' },
    { name: 'ATOL', description: 'Фискализация офлайн-платежей (АТОЛ Онлайн)' },
    { name: 'Users' },
    { name: 'Rooms' },
    { name: 'Equipment' },
    { name: 'Bookings' },
    { name: 'Forms' },
    { name: 'Payments' },
    { name: 'Promocodes', description: 'Управление промокодами и скидками' },
    { name: 'SMS', description: 'Отправка SMS/Omni, управление, вебхуки, статистика' },
    { name: 'Uploads', description: 'Загрузка файлов и изображений' },
  ],
  paths: {
    // Uploads
    '/upload/image': {
      post: {
        tags: ['Uploads'],
        summary: 'Загрузка одного изображения для комнаты или оборудования',
        description: 'Принимает multipart/form-data с полем image. Параметры: type=room|equipment, id=<ObjectId>. Сохраняет файл в соответствующую папку и возвращает публичный URL. Требует Bearer JWT и права администратора.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'type', required: true, schema: { type: 'string', enum: ['room', 'equipment'] }, description: 'Тип сущности' },
          { in: 'query', name: 'id', required: true, schema: { type: 'string' }, description: 'ID сущности (ObjectId)' },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { image: { type: 'string', format: 'binary' } },
                required: ['image']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Файл успешно загружен',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    url: { type: 'string' },
                    file: {
                      type: 'object',
                      properties: {
                        originalName: { type: 'string' },
                        size: { type: 'number' },
                        mimeType: { type: 'string' },
                        filename: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: 'Неверные параметры или файл не получен' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Сущность не найдена' }
        }
      },
      delete: {
        tags: ['Uploads'],
        summary: 'Удаление изображения',
        description: 'Удаляет изображение с диска и из базы данных. Требует Bearer JWT и права администратора.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'type', required: true, schema: { type: 'string', enum: ['room', 'equipment'] }, description: 'Тип сущности' },
          { in: 'query', name: 'id', required: true, schema: { type: 'string' }, description: 'ID сущности (ObjectId)' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { url: { type: 'string', description: 'Публичный URL изображения для удаления' } },
                required: ['url']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Изображение успешно удалено',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    url: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': { description: 'Неверные параметры или неверный формат URL' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Сущность не найдена' }
        }
      }
    },
    '/upload/images': {
      post: {
        tags: ['Uploads'],
        summary: 'Загрузка нескольких изображений',
        description: 'Принимает multipart/form-data с полем images (массив файлов). Максимум 20 файлов. Параметры: type=room|equipment, id=<ObjectId>. Требует Bearer JWT и права администратора.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'type', required: true, schema: { type: 'string', enum: ['room', 'equipment'] }, description: 'Тип сущности' },
          { in: 'query', name: 'id', required: true, schema: { type: 'string' }, description: 'ID сущности (ObjectId)' },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { images: { type: 'array', items: { type: 'string', format: 'binary' } } },
                required: ['images']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Файлы успешно загружены',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    urls: { type: 'array', items: { type: 'string' } },
                    files: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          originalName: { type: 'string' },
                          size: { type: 'number' },
                          mimeType: { type: 'string' },
                          filename: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: 'Неверные параметры или файлы не получены' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Сущность не найдена' }
        }
      }
    },
    // SMS
    '/sms/send': {
      post: {
        tags: ['SMS'],
        summary: 'Отправка SMS/Omni сообщений',
        description: 'Создание и отправка SMS через P1SMS провайдера. Поддерживаются каналы: digit, char, viber, vk, whatsapp, telegram и другие. Максимум 1000 сообщений в одном запросе.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendSmsDTO' },
            },
          },
        },
        responses: {
          '201': { description: 'Сообщения созданы и отправлены' },
          '400': { description: 'Ошибка валидации или параметров' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/sms/viber/image': {
      post: {
        tags: ['SMS'],
        summary: 'Загрузка изображения для Viber',
        description: 'Загрузка картинки (jpg/png) для использования в Viber сообщениях. Возвращает imageHash.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { 
                type: 'object', 
                properties: { 
                  img: { type: 'string', format: 'binary' } 
                }, 
                required: ['img'] 
              },
            },
          },
        },
        responses: {
          '200': { description: 'Изображение загружено' },
          '400': { description: 'Файл не получен или ошибка' },
        },
      },
    },
    '/sms/reject': {
      post: {
        tags: ['SMS'],
        summary: 'Отмена сообщений в статусе модерации',
        description: 'Отменить отправку SMS, которые находятся в статусе "moderation".',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { 
                type: 'object', 
                properties: { 
                  smsId: { type: 'array', items: { type: 'integer' } } 
                }, 
                required: ['smsId'] 
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/sms/change-planned-time': {
      post: {
        tags: ['SMS'],
        summary: 'Изменение времени отправки запланированных SMS',
        description: 'Изменить plannedAt у сообщений в статусе "planned".',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { 
                type: 'object', 
                properties: { 
                  smsId: { type: 'array', items: { type: 'integer' } }, 
                  plannedAt: { type: 'integer', description: 'Unix timestamp' } 
                }, 
                required: ['smsId', 'plannedAt'] 
              },
            },
          },
        },
        responses: {
          '200': { description: 'Время изменено' },
        },
      },
    },
    '/sms/info': {
      post: {
        tags: ['SMS'],
        summary: 'Информация о сообщениях по ID',
        description: 'Получить детальную информацию о сообщениях (стоимость, статус, время создания). Лимит: 1000 ID.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { 
                type: 'object', 
                properties: { 
                  apiSmsIdList: { type: 'array', items: { type: 'integer' } } 
                }, 
                required: ['apiSmsIdList'] 
              },
            },
          },
        },
        responses: {
          '200': { 
            description: 'OK', 
            content: { 
              'application/json': { 
                schema: { $ref: '#/components/schemas/SmsInfoResponse' } 
              } 
            } 
          },
        },
      },
    },
    '/sms/status': {
      get: {
        tags: ['SMS'],
        summary: 'Статусы сообщений',
        description: 'Получить статусы SMS по списку smsId (query параметры smsId[0], smsId[1], ...).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { 
            name: 'smsId', 
            in: 'query', 
            schema: { type: 'array', items: { type: 'integer' } }, 
            style: 'form', 
            explode: true, 
            description: 'ID сообщений' 
          },
        ],
        responses: {
          '200': { 
            description: 'OK', 
            content: { 
              'application/json': { 
                schema: { 
                  type: 'array', 
                  items: { $ref: '#/components/schemas/SmsStatusItem' } 
                } 
              } 
            } 
          },
        },
      },
    },
    '/sms/list': {
      get: {
        tags: ['SMS'],
        summary: 'Список отправленных сообщений',
        description: 'Получить список SMS с фильтрами по датам, статусам, каналам. Пагинация (20 по умолчанию, макс. 500).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Номер страницы' },
          { name: 'pageCapacity', in: 'query', schema: { type: 'integer', maximum: 500 }, description: 'Записей на странице (макс. 500)' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Поиск по номеру телефона' },
          { name: 'from', in: 'query', schema: { type: 'integer' }, description: 'Timestamp начала' },
          { name: 'to', in: 'query', schema: { type: 'integer' }, description: 'Timestamp конца' },
          { name: 'column', in: 'query', schema: { type: 'string', enum: ['created_at', 'updated_at', 'sent_at'] }, description: 'Поле сортировки' },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Порядок сортировки' },
        ],
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/sms/planned': {
      get: {
        tags: ['SMS'],
        summary: 'Список запланированных сообщений',
        description: 'Получить список SMS в статусе "planned" (20 записей на страницу).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Номер страницы' },
        ],
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/sms/statistics': {
      get: {
        tags: ['SMS'],
        summary: 'Статистика по SMS',
        description: 'Получить агрегированную статистику отправок: стоимость, количество доставленных/недоставленных, прочитанных.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'integer' }, description: 'Unix timestamp начала' },
          { name: 'endDate', in: 'query', schema: { type: 'integer' }, description: 'Unix timestamp конца' },
        ],
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/sms/phone-bases/{phoneBaseId}/phones': {
      post: {
        tags: ['SMS'],
        summary: 'Добавление номеров в базу',
        description: 'Добавить номера телефонов в существующую базу номеров.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'phoneBaseId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID базы номеров' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { 
                type: 'object', 
                properties: { 
                  phones: { 
                    type: 'array', 
                    items: { 
                      type: 'object', 
                      properties: { 
                        phone: { type: 'string' }, 
                        additionalcolumns: { type: 'object' } 
                      } 
                    } 
                  } 
                }, 
                required: ['phones'] 
              },
            },
          },
        },
        responses: {
          '200': { description: 'Добавлены' },
        },
      },
    },
    '/sms/base-phones': {
      get: {
        tags: ['SMS'],
        summary: 'Список абонентов базы',
        description: 'Получить список номеров из базы (100 записей на страницу).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'baseId', in: 'query', required: true, schema: { type: 'integer' }, description: 'ID базы' },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'column', in: 'query', schema: { type: 'string' }, description: 'Поле сортировки (created_at)' },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/sms/bases': {
      get: {
        tags: ['SMS'],
        summary: 'Список баз номеров',
        description: 'Получить список всех баз номеров пользователя.',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/sms/blacklist': {
      get: {
        tags: ['SMS'],
        summary: 'Чёрный список',
        description: 'Получить список номеров из чёрного списка (100 записей на страницу).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/sms/templates/vk': {
      get: {
        tags: ['SMS'],
        summary: 'Шаблоны VK (ВКонтакте)',
        description: 'Получить список доступных шаблонов для отправки через ВКонтакте.',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/sms/cascade-schemes': {
      get: {
        tags: ['SMS'],
        summary: 'Схемы каскадных сообщений',
        description: 'Получить список схем каскадных рассылок.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Строка поиска' },
        ],
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/sms/senders': {
      post: {
        tags: ['SMS'],
        summary: 'Создание отправителя',
        description: 'Создать нового отправителя (sender) для SMS. Требуется для буквенных каналов.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string', description: 'Канал (char)' },
                  name: { type: 'string', description: 'Имя отправителя (до 11 символов)' },
                  companyName: { type: 'string', description: 'Название компании' },
                  link: { type: 'string', description: 'Ссылка на сайт компании' },
                  attachments: { 
                    type: 'array', 
                    items: { type: 'string', format: 'binary' }, 
                    description: 'Файлы (doc, pdf, png)' 
                  },
                },
                required: ['type', 'name', 'companyName', 'link'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Отправитель создан' },
        },
      },
    },
    '/sms/balance': {
      get: {
        tags: ['SMS'],
        summary: 'Баланс клиента',
        description: 'Получить текущий баланс на аккаунте P1SMS.',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/sms/webhook': {
      post: {
        tags: ['SMS'],
        summary: 'Webhook статусов (от провайдера)',
        description: 'Принимает уведомления от P1SMS об изменении статусов сообщений. Этот URL передаётся провайдеру при отправке.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { 
                type: 'object', 
                properties: { 
                  sms_id: { type: 'integer' }, 
                  sms_status: { type: 'string' }, 
                  receive_date: { type: 'string' } 
                } 
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    // Auth
    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'Вход пользователя',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginDTO' },
            },
          },
        },
        responses: {
          '200': { description: 'Успешный вход' },
          '401': { description: 'Неверные учетные данные' },
        },
      },
    },
    '/register': {
      post: {
        tags: ['Auth'],
        summary: 'Регистрация пользователя',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterDTO' } },
          },
        },
        responses: {
          '201': { description: 'Пользователь создан' },
          '400': { description: 'Ошибка валидации' },
        },
      },
    },
    // Users
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Список пользователей',
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Пользователь по ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
      },
    },
    '/user': {
      post: {
        tags: ['Users'],
        summary: 'Создать пользователя',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserDTO' } } },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/user/favorites/rooms/{roomId}': {
      post: {
        tags: ['Users'],
        summary: 'Добавить комнату в избранное пользователя',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '204': { description: 'Добавлено или уже было в избранном' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Комната не найдена' }
        },
      },
    },
    '/admin/create-user': {
      post: {
        tags: ['Users'],
        summary: 'Создать пользователя (админ)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminCreateUserDTO' } } },
        },
        responses: {
          '201': { description: 'Created' },
          '400': { description: 'Ошибка валидации' },
          '409': { description: 'Пользователь с таким email уже существует' },
        },
      },
    },
    '/admin/users/{id}': {
      put: {
        tags: ['Users'],
        summary: 'Обновить информацию пользователя (админ)',
        description: 'Позволяет администратору изменять всю информацию пользователя: email, телефон, ФИО, баланс, бонусные баллы',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID пользователя'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminUpdateUserDTO' },
              example: {
                email: 'newemail@example.com',
                phone: '+79991234567',
                fullName: 'Иванов Иван Иванович',
                balance: 1000,
                points: 500
              }
            }
          },
        },
        responses: {
          '200': {
            description: 'Пользователь успешно обновлён',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    fullName: { type: 'string' },
                    balance: { type: 'number' },
                    points: { type: 'number' },
                    favoriteRoomIds: { type: 'array', items: { type: 'string' } },
                    bookings: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          '400': { description: 'Ошибка валидации' },
          '404': { description: 'Пользователь не найден' },
          '409': { description: 'Пользователь с таким email уже существует' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        },
      },
    },
    // Rooms
    '/rooms': {
      get: { tags: ['Rooms'], summary: 'Список залов', responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Room' } } } } } } },
      post: { tags: ['Rooms'], summary: 'Создать зал', responses: { '201': { description: 'Created' } } },
    },
    '/rooms/{id}': {
      put: {
        tags: ['Rooms'],
        summary: 'Обновить зал (админ)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', description: 'Любые поля для обновления', properties: {
            name: { type: 'string' },
            address: { type: 'string' },
            area: { type: 'number' },
            pricePerHour: { type: 'number' },
            colorScheme: { type: 'array', items: { type: 'string' } },
            styles: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' },
          } } } },
        },
        responses: {
          '200': { description: 'Updated' },
          '400': { description: 'Ошибка валидации' },
          '404': { description: 'Зал не найден' },
        },
      },
      get: {
        tags: ['Rooms'],
        summary: 'Получить зал по ID',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: { '200': { description: 'OK' }, '404': { description: 'Зал не найден' } },
      }
    },
    // Bookings
    '/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'Список броней',
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Создать бронь',
        description: 'Создание нового бронирования. Поддерживаются два формата указания оборудования:\n\n1. **Новый формат (рекомендуется)**: `equipment` - массив объектов с `equipmentId` и `quantity`\n2. **Старый формат (совместимость)**: `equipmentIds` - массив ID, автоматически преобразуется в `equipment` с `quantity=1`\n\n**Важно**: Система проверяет доступность оборудования - если запрошенное количество превышает доступное, будет ошибка 400.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 
            'application/json': { 
              schema: { $ref: '#/components/schemas/CreateBookingDTO' },
              examples: {
                newFormat: {
                  summary: 'Новый формат с количеством',
                  value: {
                    roomId: '507f1f77bcf86cd799439011',
                    equipment: [
                      { equipmentId: '507f191e810c19729de860ea', quantity: 2 },
                      { equipmentId: '507f191e810c19729de860eb', quantity: 1 }
                    ],
                    start: '2024-03-20T10:00:00.000Z',
                    end: '2024-03-20T14:00:00.000Z'
                  }
                },
                oldFormat: {
                  summary: 'Старый формат (совместимость)',
                  value: {
                    roomId: '507f1f77bcf86cd799439011',
                    equipmentIds: ['507f191e810c19729de860ea', '507f191e810c19729de860eb'],
                    start: '2024-03-20T10:00:00.000Z',
                    end: '2024-03-20T14:00:00.000Z'
                  }
                }
              }
            } 
          },
        },
        responses: {
          '201': {
            description: 'Бронирование успешно создано',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } },
          },
          '400': { description: 'Ошибка валидации, пересечение времени или недостаточно доступного оборудования' }
        },
      },
    },
    '/bookings/{id}': {
      put: {
        tags: ['Bookings'],
        summary: 'Обновить бронь (админ)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateBookingDTO' } },
          },
        },
        responses: {
          '200': { description: 'Updated' },
          '400': { description: 'Ошибка валидации или пересечение времени' },
          '403': { description: 'Недостаточно прав' },
          '404': { description: 'Бронь не найдена' },
        },
      },
    },
    '/admin/create-booking': {
      post: {
        tags: ['Bookings'],
        summary: 'Создать бронь от имени пользователя (админ)',
        description: 'Создание бронирования администратором от имени пользователя. Поддерживаются два формата указания оборудования:\n\n1. **Новый формат (рекомендуется)**: `equipment` - массив объектов с `equipmentId` и `quantity`\n2. **Старый формат (совместимость)**: `equipmentIds` - массив ID, автоматически преобразуется в `equipment` с `quantity=1`\n\n**Особенности**:\n- Система проверяет доступность оборудования по количеству\n- Цена рассчитывается автоматически с учётом количества оборудования\n- Требуется указать способ оплаты (наличные или карта на месте)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { 
              schema: { $ref: '#/components/schemas/AdminCreateBookingDTO' },
              examples: {
                newFormat: {
                  summary: 'Новый формат с количеством',
                  value: {
                    userId: '507f1f77bcf86cd799439012',
                    roomId: '507f1f77bcf86cd799439011',
                    equipment: [
                      { equipmentId: '507f191e810c19729de860ea', quantity: 3 },
                      { equipmentId: '507f191e810c19729de860eb', quantity: 1 }
                    ],
                    start: '2024-03-25T09:00:00.000Z',
                    end: '2024-03-25T18:00:00.000Z',
                    paymentMethod: 'on_site_card'
                  }
                },
                oldFormat: {
                  summary: 'Старый формат (совместимость)',
                  value: {
                    userId: '507f1f77bcf86cd799439012',
                    roomId: '507f1f77bcf86cd799439011',
                    equipmentIds: ['507f191e810c19729de860ea', '507f191e810c19729de860eb'],
                    start: '2024-03-25T09:00:00.000Z',
                    end: '2024-03-25T18:00:00.000Z',
                    paymentMethod: 'on_site_cash'
                  }
                }
              }
            },
          },
        },
        responses: {
          '201': {
            description: 'Бронирование успешно создано',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } },
          },
          '400': { description: 'Ошибка валидации, пересечение времени, недостаточно оборудования или не найдены сущности' },
          '403': { description: 'Недостаточно прав (требуется роль администратора)' },
        },
      },
    },
    // Forms
    '/forms': { get: { tags: ['Forms'], summary: 'Список форм', responses: { '200': { description: 'OK' } } } },
    '/form': {
      post: {
        tags: ['Forms'],
        summary: 'Создать форму',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateFormDTO' } } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Ошибка валидации' } },
      },
    },
    // Equipment
    '/equipment': {
      get: {
        tags: ['Equipment'],
        summary: 'Список оборудования',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Equipment' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Equipment'],
        summary: 'Создать оборудование',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateEquipmentDTO' } },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Equipment' } } },
          },
          '400': { description: 'Ошибка валидации' },
        },
      },
    },
    '/equipment/{id}': {
      put: {
        tags: ['Equipment'],
        summary: 'Обновить оборудование (админ)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            pricePerHour: { type: 'number' },
            image: { type: 'string' },
          } } } },
        },
        responses: {
          '200': { description: 'Updated' },
          '400': { description: 'Ошибка валидации' },
          '404': { description: 'Оборудование не найдено' },
        },
      },
    },
    // Payments
    '/payments': {
      get: { tags: ['Payments'], summary: 'Список платежей', responses: { '200': { description: 'OK' } } },
      post: {
        tags: ['Payments'],
        summary: 'Создать платёж (через YooKassa)',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentCreateRequest' } } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Ошибка валидации' } },
      },
    },
    '/admin/payments': {
      post: {
        tags: ['Payments'],
        summary: 'Создать платёж со скидкой (только админ)',
        description: 'Позволяет администратору создать ссылку на оплату со специальной скидкой. Например, пользователь позвонил менеджеру, попросил скидку, менеджер создаёт платёж с уменьшенной суммой.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminCreatePaymentDTO' },
              example: {
                bookingId: '507f1f77bcf86cd799439011',
                discountAmount: 2000,
                discountReason: 'Скидка по запросу клиента',
                return_url: 'http://picassostudio.ru/'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Платёж создан успешно',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    payment: {
                      type: 'object',
                      description: 'Объект платежа от YooKassa с ссылкой на оплату'
                    },
                    discount: {
                      type: 'object',
                      properties: {
                        amount: { type: 'number', description: 'Размер скидки' },
                        reason: { type: 'string', description: 'Причина скидки' },
                        originalAmount: { type: 'number', description: 'Исходная сумма' },
                        finalAmount: { type: 'number', description: 'Итоговая сумма к оплате' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: 'Ошибка валидации или бронирование уже оплачено' },
          '404': { description: 'Бронирование или пользователь не найдены' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      }
    },
    '/payments/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Статус платежа',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
      },
    },
    '/receipts/{receiptId}': {
      get: {
        tags: ['Payments'],
        summary: 'Получить информацию о чеке',
        description: 'Запрос позволяет получить информацию о текущем состоянии чека по его уникальному идентификатору из ЮKassa.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { 
            name: 'receiptId', 
            in: 'path', 
            required: true, 
            schema: { type: 'string' },
            description: 'Уникальный идентификатор чека (например: rt-2da5c87d-0384-50e8-a7f3-8d5646dd9e10)',
            example: 'rt-2da5c87d-0384-50e8-a7f3-8d5646dd9e10'
          }
        ],
        responses: { 
          '200': { 
            description: 'Информация о чеке успешно получена',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', description: 'Идентификатор чека' },
                    type: { type: 'string', enum: ['payment', 'refund'], description: 'Тип чека' },
                    status: { type: 'string', enum: ['pending', 'succeeded', 'canceled'], description: 'Статус чека' },
                    payment_id: { type: 'string', description: 'ID платежа' },
                    fiscal_document_number: { type: 'string', description: 'Номер фискального документа' },
                    fiscal_storage_number: { type: 'string', description: 'Номер фискального накопителя' },
                    fiscal_attribute: { type: 'string', description: 'Фискальный признак документа' },
                    registered_at: { type: 'string', format: 'date-time', description: 'Дата и время регистрации чека' },
                    fiscal_provider_id: { type: 'string', description: 'ID фискального провайдера' },
                    tax_system_code: { type: 'integer', enum: [1, 2, 3, 4, 5, 6], description: 'Код системы налогообложения' },
                    items: { 
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          description: { type: 'string', description: 'Название товара' },
                          quantity: { type: 'number', description: 'Количество' },
                          amount: { 
                            type: 'object',
                            properties: {
                              value: { type: 'string', description: 'Сумма' },
                              currency: { type: 'string', description: 'Валюта' }
                            }
                          },
                          vat_code: { type: 'integer', description: 'Ставка НДС' },
                          payment_mode: { type: 'string', description: 'Признак способа расчёта' },
                          payment_subject: { type: 'string', description: 'Признак предмета расчёта' }
                        }
                      }
                    },
                    settlements: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string', description: 'Тип оплаты' },
                          amount: {
                            type: 'object',
                            properties: {
                              value: { type: 'string' },
                              currency: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                example: {
                  id: 'rt-2da5c87d-0384-50e8-a7f3-8d5646dd9e10',
                  type: 'payment',
                  status: 'succeeded',
                  payment_id: '225d8da0-000f-50be-b000-0003308c89be',
                  fiscal_document_number: '3997',
                  fiscal_storage_number: '9288000100115786',
                  fiscal_attribute: '2617603922',
                  registered_at: '2019-09-18T10:06:42.985Z',
                  fiscal_provider_id: 'fd9e9404-eaca-4000-8ec9-dc228ead2346',
                  items: [
                    {
                      quantity: 5.000,
                      amount: { value: '1500.30', currency: 'RUB' },
                      vat_code: 2,
                      description: 'Capybara',
                      payment_mode: 'full_payment',
                      payment_subject: 'commodity'
                    }
                  ],
                  tax_system_code: 1,
                  settlements: [
                    {
                      type: 'cashless',
                      amount: { value: '45.67', currency: 'RUB' }
                    }
                  ]
                }
              }
            }
          },
          '400': { description: 'Некорректный ID чека' },
          '404': { description: 'Чек не найден' },
          '500': { description: 'Ошибка при получении данных из ЮKassa' }
        },
      },
    },
    // Promocodes
    '/promocodes': {
      post: {
        tags: ['Promocodes'],
        summary: 'Создать новый промокод',
        description: 'Создание нового промокода. Только для администраторов.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePromocodeDTO' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Промокод успешно создан',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Promocode' }
              }
            }
          },
          '400': { description: 'Ошибка валидации или промокод с таким кодом уже существует' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      },
      get: {
        tags: ['Promocodes'],
        summary: 'Получить список всех промокодов',
        description: 'Получение списка всех промокодов. Только для администраторов.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'skip',
            schema: { type: 'integer', default: 0 },
            description: 'Количество записей для пропуска'
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 100 },
            description: 'Максимальное количество записей'
          }
        ],
        responses: {
          '200': {
            description: 'Список промокодов',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Promocode' }
                }
              }
            }
          },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      }
    },
    '/promocodes/validate': {
      post: {
        tags: ['Promocodes'],
        summary: 'Проверить валидность промокода',
        description: 'Проверка промокода на валидность (активность, срок действия, лимит использований).',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidatePromocodeDTO' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Результат валидации',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valid: { type: 'boolean', description: 'Валиден ли промокод' },
                    promocode: { $ref: '#/components/schemas/Promocode', description: 'Данные промокода (если валиден)' },
                    error: { type: 'string', description: 'Сообщение об ошибке (если не валиден)' }
                  }
                }
              }
            }
          },
          '400': { description: 'Ошибка валидации запроса' },
          '401': { description: 'Не авторизован' }
        }
      }
    },
    '/promocodes/{id}': {
      get: {
        tags: ['Promocodes'],
        summary: 'Получить промокод по ID',
        description: 'Получение промокода по идентификатору. Только для администраторов.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID промокода'
          }
        ],
        responses: {
          '200': {
            description: 'Промокод найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Promocode' }
              }
            }
          },
          '404': { description: 'Промокод не найден' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      },
      put: {
        tags: ['Promocodes'],
        summary: 'Обновить промокод',
        description: 'Обновление данных промокода. Только для администраторов.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID промокода'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePromocodeDTO' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Промокод обновлён',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Promocode' }
              }
            }
          },
          '404': { description: 'Промокод не найден' },
          '400': { description: 'Ошибка валидации' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      },
      delete: {
        tags: ['Promocodes'],
        summary: 'Удалить промокод',
        description: 'Мягкое удаление промокода (установка флага isDeleted). Только для администраторов.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID промокода'
          }
        ],
        responses: {
          '200': {
            description: 'Промокод удалён',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Промокод успешно удалён' }
                  }
                }
              }
            }
          },
          '404': { description: 'Промокод не найден' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      }
    },
    '/equipment??': {
      get: {
        tags: ['Equipment'],
        summary: 'Получить список оборудования (для пользователей)',
        description: 'Возвращает список активного оборудования (без удалённых).',
        responses: {
          '200': {
            description: 'Список оборудования',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Equipment' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Equipment'],
        summary: 'Создать оборудование (только админ)',
        description: 'Создание нового оборудования. Требуется авторизация администратора.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateEquipmentDTO' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Оборудование создано',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Equipment' }
              }
            }
          },
          '400': { description: 'Ошибка валидации' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      }
    },
    '/admin/equipment': {
      get: {
        tags: ['Equipment'],
        summary: 'Получить всё оборудование (для админов)',
        description: 'Возвращает список всего оборудования включая удалённое. Только для администраторов.',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Список всего оборудования',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Equipment' }
                }
              }
            }
          },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      }
    },
    '/equipment/{id}?': {
      put: {
        tags: ['Equipment'],
        summary: 'Обновить оборудование (только админ)',
        description: 'Обновление данных оборудования. Требуется авторизация администратора.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID оборудования'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateEquipmentDTO' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Оборудование обновлено',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Equipment' }
              }
            }
          },
          '404': { description: 'Оборудование не найдено' },
          '400': { description: 'Ошибка валидации' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      },
      delete: {
        tags: ['Equipment'],
        summary: 'Удалить оборудование (только админ)',
        description: 'Мягкое удаление оборудования (установка флага isDeleted). Требуется авторизация администратора.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID оборудования'
          }
        ],
        responses: {
          '200': {
            description: 'Оборудование удалено',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Equipment deleted successfully' }
                  }
                }
              }
            }
          },
          '404': { description: 'Оборудование не найдено' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      }
    },
    '/rooms??': {
      get: {
        tags: ['Rooms'],
        summary: 'Получить список студий (для пользователей)',
        description: 'Возвращает список активных студий (без удалённых).',
        responses: {
          '200': {
            description: 'Список студий',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Room' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Rooms'],
        summary: 'Создать студию (только админ)',
        description: 'Создание новой студии. Требуется авторизация администратора.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateRoomDTO' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Студия создана',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Room' }
              }
            }
          },
          '400': { description: 'Ошибка валидации' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      }
    },
    '/admin/rooms': {
      get: {
        tags: ['Rooms'],
        summary: 'Получить все студии (для админов)',
        description: 'Возвращает список всех студий включая удалённые. Только для администраторов.',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Список всех студий',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Room' }
                }
              }
            }
          },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      }
    },
    '/rooms/{id}?': {
      get: {
        tags: ['Rooms'],
        summary: 'Получить студию по ID',
        description: 'Возвращает детальную информацию о студии.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID студии'
          }
        ],
        responses: {
          '200': {
            description: 'Информация о студии',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Room' }
              }
            }
          },
          '404': { description: 'Студия не найдена' }
        }
      },
      put: {
        tags: ['Rooms'],
        summary: 'Обновить студию (только админ)',
        description: 'Обновление данных студии. Требуется авторизация администратора.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID студии'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateRoomDTO' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Студия обновлена',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Room' }
              }
            }
          },
          '404': { description: 'Студия не найдена' },
          '400': { description: 'Ошибка валидации' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      },
      delete: {
        tags: ['Rooms'],
        summary: 'Удалить студию (только админ)',
        description: 'Мягкое удаление студии (установка флага isDeleted). Требуется авторизация администратора.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID студии'
          }
        ],
        responses: {
          '200': {
            description: 'Студия удалена',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Room deleted successfully' }
                  }
                }
              }
            }
          },
          '404': { description: 'Студия не найдена' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' }
        }
      }
    },
    '/admin/notifications/stats': {
      get: {
        tags: ['Notifications'],
        summary: 'Получить статистику уведомлений (только админ)',
        description: 'Возвращает статистику по уведомлениям и очередям Bull. Требуется авторизация администратора.',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Статистика получена',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        database: {
                          type: 'object',
                          properties: {
                            total: { type: 'number' },
                            byStatus: { type: 'object' },
                            byType: { type: 'object' },
                            failureRate: { type: 'number' },
                          },
                        },
                        queues: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' },
          '500': { description: 'Ошибка сервера' },
        },
      },
    },
    '/admin/notifications/health': {
      get: {
        tags: ['Notifications'],
        summary: 'Health check системы уведомлений (только админ)',
        description: 'Проверяет работоспособность Redis и очередей уведомлений.',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Система работает нормально',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        redis: { type: 'boolean' },
                        activeJobs: { type: 'number' },
                        timestamp: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          '503': { description: 'Система недоступна' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' },
        },
      },
    },
    '/admin/notifications/booking/{bookingId}': {
      get: {
        tags: ['Notifications'],
        summary: 'Получить уведомления по бронированию (только админ)',
        description: 'Возвращает все уведомления для конкретного бронирования.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'bookingId',
            required: true,
            schema: { type: 'string' },
            description: 'ID бронирования (ObjectId)',
          },
        ],
        responses: {
          '200': {
            description: 'Уведомления получены',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notification' },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Невалидный ID' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' },
          '500': { description: 'Ошибка сервера' },
        },
      },
    },
    '/admin/notifications/cancel/{bookingId}': {
      post: {
        tags: ['Notifications'],
        summary: 'Отменить уведомления для бронирования (только админ)',
        description: 'Отменяет все запланированные уведомления для бронирования.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'bookingId',
            required: true,
            schema: { type: 'string' },
            description: 'ID бронирования (ObjectId)',
          },
        ],
        responses: {
          '200': {
            description: 'Уведомления отменены',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        cancelled: { type: 'number', description: 'Количество отменённых уведомлений' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Невалидный ID' },
          '401': { description: 'Не авторизован' },
          '403': { description: 'Доступ запрещён (не админ)' },
          '500': { description: 'Ошибка сервера' },
        },
      },
    },
  },
};

export default openapiSpec;