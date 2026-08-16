import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

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
          `${method} ${url} ${delay}ms
          Params: ${JSON.stringify(params)}
          Query: ${JSON.stringify(query)}
          Body: ${JSON.stringify(body)}
          Data: ${data}`,
        );
      }),
    );
  }
}
