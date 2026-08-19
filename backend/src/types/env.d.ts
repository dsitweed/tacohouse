declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
    DATABASE_URL: string;
    CLOUDFLARE_R2_ACCOUNT_ID: string;
    CLOUDFLARE_R2_ACCESS_KEY_ID: string;
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: string;
    CLOUDFLARE_R2_PRIVATE_BUCKET_NAME: string;
    CLOUDFLARE_R2_PUBLIC_BUCKET_NAME: string;
    CLOUDFLARE_R2_PUBLIC_DOMAIN: string;
  }
}
