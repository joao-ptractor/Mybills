import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro no banco de dados';

    switch (exception.code) {
      case 'P2002': {
        statusCode = HttpStatus.CONFLICT;
        const target = exception.meta?.target as string[];
        const fields = target ? target.join(', ') : 'desconhecido';
        message = `Conflito de dados: o registro já existe (campo: ${fields})`;
        break;
      }
      case 'P2025': {
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado no banco de dados.';
        break;
      }
      case 'P2003': {
        statusCode = HttpStatus.BAD_REQUEST;
        const field_name = exception.meta?.field_name as string;
        message = `Falha de restrição de chave estrangeira no campo: ${field_name || 'desconhecido'}`;
        break;
      }
      default:
        message = `Erro de banco de dados (Código: ${exception.code})`;
        break;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: exception.name
    });
  }
}
