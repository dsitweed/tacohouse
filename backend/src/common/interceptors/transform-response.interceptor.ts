import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'statusCode' in data
        ) {
          return data;
        }

        let responseData = {};
        let responseMessage = '';

        if (data && typeof data === 'object') {
          if ('message' in data) {
            const { message, ...rest } = data;
            responseMessage = message as string;
            responseData = rest;
          }

          if ('data' in data) responseData = data.data as object;
        }

        return {
          statusCode: response.statusCode,
          message: responseMessage || 'Success',
          data: Object.keys(responseData).length > 0 ? responseData : data,
        };
      }),
    );
  }
}
