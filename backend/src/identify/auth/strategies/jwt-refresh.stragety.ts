import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_TOKEN_TYPE, AuthService } from '../auth.service';
import { AuthCookies, JwtPayload } from './jwt.strategy';

const extractRefreshTokenFromCookie = (request: Request): string | null => {
  const cookies = request.cookies as AuthCookies;
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

  async validate(payload: JwtPayload & { type: AUTH_TOKEN_TYPE; jti: string }) {
    if (payload.type !== AUTH_TOKEN_TYPE.REFRESH) {
      throw new UnauthorizedException();
    }
    const user = await this.authService.validateRefreshSession(
      payload.sub,
      payload.jti,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return { ...user, refreshTokenId: payload.jti };
  }
}
