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
        let reponsePagination = {};

        if (data && typeof data === 'object') {
          const { message, pagination, ...rest } = data as Record<string, any>;

          if (message) responseMessage = message as string;
          if (pagination) reponsePagination = pagination as object;

          responseData = (rest.data || rest) as object;
        }

        return {
          statusCode: response.statusCode,
          message: responseMessage || 'Success',
          data: Object.keys(responseData).length > 0 ? responseData : data,
          pagination: reponsePagination,
        };
      }),
    );
  }
}
