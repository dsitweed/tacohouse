import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from 'express';
import { UserWithRelations } from 'src/types';

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as UserWithRelations;
  },
);
