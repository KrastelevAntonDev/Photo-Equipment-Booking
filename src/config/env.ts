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

  // Payments
  SHOP_ID: z.string().optional(),
  SECRET_KEY: z.string().optional(),

  // SMS Provider (P1SMS)
  P1SMS_API_KEY: z.string().optional(),
  P1SMS_BASE_URL: z.string().default('https://admin.p1sms.ru'),
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
