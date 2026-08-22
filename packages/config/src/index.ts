import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  WEB_ORIGIN: z.string().url(),
  API_PORT: z.coerce.number().int().positive().default(3001),
  SESSION_SECRET: z.string().min(32),
  ENABLE_MERCADO_LIVRE: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  ENABLE_SHOPEE: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  ENABLE_WHATSAPP: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
});

export type AppEnv = z.infer<typeof envSchema>;
export const parseEnv = (env: NodeJS.ProcessEnv): AppEnv => envSchema.parse(env);
