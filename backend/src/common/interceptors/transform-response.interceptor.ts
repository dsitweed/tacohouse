import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PaginationMeta } from 'types';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((body) => {
        let data: T;
        let message = 'Success';
        let pagination: PaginationMeta | undefined;

        if (this.isEnvelope(body)) {
          data = body.data as T;

          if (typeof body.message === 'string') {
            message = body.message;
          }

          if (body.pagination) {
            pagination = body.pagination as PaginationMeta;
          }
        } else {
          data = body;
        }

        return {
          statusCode: response.statusCode,
          message,
          data,
          ...(pagination && { pagination }),
        };
      }),
    );
  }

  private isEnvelope(value: unknown): value is {
    data: unknown;
    message?: unknown;
    pagination?: unknown;
  } {
    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      'data' in value
    );
  }
}
