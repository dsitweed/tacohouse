import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UserWithRelations } from 'src/types';

import { ROLES_KEY } from '../decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role required, access allowed
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as UserWithRelations;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permission');
    }

    return true;
  }
}
