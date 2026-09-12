import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly config: ConfigService) {}

  // TODO: Move this logic to Auth module; EmailService should only handle email delivery.
  async sendVerificationEmail(email: string, token: string) {
    return this.getDevelopmentToken(email, token);
  }

  // TODO: Move this logic to Auth module; EmailService should only handle email delivery.
  async sendPasswordResetEmail(email: string, token: string) {
    return this.getDevelopmentToken(email, token);
  }

  // TODO: Implement actual email sending logic for production environment
  // Now just simulate email sending in development environment
  private getDevelopmentToken(email: string, token: string) {
    if (this.config.get('AUTH_EXPOSE_DEV_TOKENS')) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve({ email, token });
  }
}
