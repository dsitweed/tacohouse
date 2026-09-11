import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, params, query } = request;
    const body = request.body as Record<string, unknown>;
    const start = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const delay = Date.now() - start;
        this.logger.debug(
          `${method} ${url} ${delay}ms [SUCCESS]
          Params: ${JSON.stringify(params)}
          Query: ${JSON.stringify(query)}
          Body: ${JSON.stringify(body)}
          Response: ${data}`,
        );
      }),
      catchError((error: Error) => {
        const delay = Date.now() - start;
        this.logger.error(
          `${method} ${url} ${delay}ms [ERROR]
          Params: ${JSON.stringify(params)}
          Query: ${JSON.stringify(query)}
          Body: ${JSON.stringify(body)}
          Error: ${error.message}
          Stack: ${error.stack}`,
        );
        throw error;
      }),
    );
  }
}
