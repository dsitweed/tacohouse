import { EnvConfig } from '../config/env.config';

// Module augmentation to add type safety to ConfigService
declare module '@nestjs/config' {
  interface ConfigService {
    get<K extends keyof EnvConfig>(key: K): EnvConfig[K];
    get<K extends keyof EnvConfig>(
      key: K,
      defaultValue: EnvConfig[K],
    ): EnvConfig[K];
  }
}
