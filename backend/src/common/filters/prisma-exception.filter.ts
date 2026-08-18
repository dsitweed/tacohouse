import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { Prisma } from 'generated/prisma/client';

export type ErrorCodeStatus = {
  statusCode: number;
  message: string;
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly defaultMapping: Record<string, ErrorCodeStatus> = {
    P2000: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'The provided value is too long for the column type.',
    },
    P2002: {
      statusCode: HttpStatus.CONFLICT,
      message: 'Unique constraint failed on one or more fields.',
    },
    P2025: {
      statusCode: HttpStatus.NOT_FOUND,
      message: 'The requested record was not found.',
    },
  };

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const error = this.defaultMapping[exception.code];

    if (error === undefined) {
      return super.catch(exception, host);
    }

    response.status(error.statusCode).json(error);
  }
}
