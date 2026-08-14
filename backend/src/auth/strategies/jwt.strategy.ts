import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';

// TODO: replace type
export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export type AuthCookies = {
  accessToken?: string;
  refreshToken?: string;
};

const extractAccessTokenFromCookie = (request: Request): string | null => {
  const cookies = request.cookies as AuthCookies;
  return cookies?.accessToken ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractAccessTokenFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateJwtUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
