import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    switch (exception.code) {
      case 'P2002': {
        statusCode = HttpStatus.CONFLICT;
        const target = exception.meta?.target as string[];
        const fields = target ? target.join(', ') : 'unknown';
        message = `Data conflict: the record already exists (field: ${fields})`;
        break;
      }
      case 'P2025': {
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Record not found in database.';
        break;
      }
      case 'P2003': {
        statusCode = HttpStatus.BAD_REQUEST;
        const field_name = exception.meta?.field_name as string;
        message = `Foreign key constraint failure on field: ${field_name || 'unknown'}`;
        break;
      }
      default:
        message = `Database error (Code: ${exception.code})`;
        break;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: exception.name
    });
  }
}
