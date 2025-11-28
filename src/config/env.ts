import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env once at app startup
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  JSON_LIMIT: z.string().default('10mb'),

  // MongoDB
  MONGODB_URI: z.string().default('mongodb://localhost:'),
  MONGODB_PORT: z.string().default('27017'),
  MONGODB_NAME: z.string().default('myDB'),
  MONGO_USERNAME: z.string().default('admin'),
  MONGO_PASSWORD: z.string().default('password'),

  // Payments
  SHOP_ID: z.string().optional(),
  SECRET_KEY: z.string().optional(),

  // SMS Provider (P1SMS)
  P1SMS_API_KEY: z.string().optional(),
  P1SMS_BASE_URL: z.string().default('https://admin.p1sms.ru'),

  // ATOL (Offline Cash Register)
  ATOL_LOGIN: z.string().default(''),
  ATOL_PASSWORD: z.string().default(''),
  ATOL_GROUP_CODE: z.string().default(''),
  ATOL_INN: z.string().default(''),
  ATOL_PAYMENT_ADDRESS: z.string().default(''),
  ATOL_COMPANY_EMAIL: z.string().optional(),
  ATOL_BASE_URL: z.string().default('https://online.atol.ru'),

  // Redis (for Bull queues)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).default(0),
	dev_admin_pass: z.string(),
	full_admin_pass: z.string(),
	admin_pass: z.string(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  // Fail fast to avoid undefined behavior in runtime
  process.exit(1);
}

export const env = parsed.data;
export const isProd = () => env.NODE_ENV === 'production';
export type AppEnv = typeof env;
