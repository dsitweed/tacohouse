import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3005),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string(),
  CLOUDFLARE_R2_ACCOUNT_ID: z.string(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_R2_PRIVATE_BUCKET_NAME: z.string(),
  CLOUDFLARE_R2_PUBLIC_BUCKET_NAME: z.string(),
  CLOUDFLARE_R2_PUBLIC_DOMAIN: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;
export const validateEnv = (config: Record<string, unknown>) =>
  envSchema.parse(config);
