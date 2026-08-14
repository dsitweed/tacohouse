import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from 'auth/auth.service';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthCookies, JwtPayload } from './jwt.strategy';

const extractRefreshTokenFromCookie = (request: Request): string | null => {
  const cookies = request.cookies as AuthCookies;
  console.log({
    request,
  });
  return cookies?.refreshToken ?? null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractRefreshTokenFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: JwtPayload & { type: string }) {
    const user = await this.authService.validateJwtUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
