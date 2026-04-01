import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { InvalidArgumentError } from '../errors/invalid-argument.error';
import { AlreadyExistsError } from '../errors/already-exists.error';
import { NotFoundError } from '../errors/not-found.error';

@Catch(InvalidArgumentError, AlreadyExistsError, NotFoundError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal server error';

    if (exception instanceof InvalidArgumentError) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Invalid request';
    } else if (exception instanceof AlreadyExistsError) {
      statusCode = HttpStatus.CONFLICT;
      error = 'Conflict';
    } else if (exception instanceof NotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      error = 'Not found';
    }

    response.status(statusCode).json({
      statusCode,
      message: exception.message,
      error
    });
  }
}
