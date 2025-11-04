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
        },
      },
      CreateBookingDTO: {
        type: 'object',
        required: ['roomId', 'start', 'end'],
        properties: {
          roomId: { type: 'string' },
          equipmentIds: { type: 'array', items: { type: 'string' } },
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
        },
      },
      UpdateBookingDTO: {
        type: 'object',
        properties: {
          roomId: { type: 'string' },
          equipmentIds: { type: 'array', items: { type: 'string' } },
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
          totalPrice: { type: 'number' },
          paymentMethod: { type: 'string', enum: ['online', 'on_site_cash', 'on_site_card'] },
          isPaid: { type: 'boolean' },
        },
      },
      AdminCreateBookingDTO: {
        type: 'object',
        required: ['userId', 'roomId', 'start', 'end', 'paymentMethod'],
        properties: {
          userId: { type: 'string' },
          roomId: { type: 'string' },
          equipmentIds: { type: 'array', items: { type: 'string' } },
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
          totalPrice: { type: 'number' },
          paymentMethod: { type: 'string', enum: ['on_site_cash', 'on_site_card'] },
        },
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
      CreateUserDTO: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      AdminCreateUserDTO: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
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
      Equipment: {
        type: 'object',
        properties: {
          _id: { type: 'string', description: 'ObjectId' },
          name: { type: 'string' },
          description: { type: 'string' },
          pricePerHour: { type: 'number' },
          image: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          isDeleted: { type: 'boolean' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Rooms' },
    { name: 'Equipment' },
    { name: 'Bookings' },
    { name: 'Forms' },
    { name: 'Payments' },
  ],
  paths: {
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
    // Rooms
    '/rooms': {
      get: { tags: ['Rooms'], summary: 'Список залов', responses: { '200': { description: 'OK' } } },
      post: { tags: ['Rooms'], summary: 'Создать зал', responses: { '201': { description: 'Created' } } },
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
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBookingDTO' } } },
        },
        responses: { '201': { description: 'Created' }, '400': { description: 'Ошибка валидации/пересечение' } },
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
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AdminCreateBookingDTO' } },
          },
        },
        responses: {
          '201': { description: 'Created' },
          '400': { description: 'Ошибка валидации/пересечение/не найдены сущности' },
          '403': { description: 'Недостаточно прав' },
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
    '/payments/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Статус платежа',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
      },
    },
  },
};

export default openapiSpec;