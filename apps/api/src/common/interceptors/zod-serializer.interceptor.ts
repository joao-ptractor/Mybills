import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ZodType } from 'zod';
import { Reflector } from '@nestjs/core';
import { SERIALIZE_KEY } from '../decorators/serialize.decorator';

@Injectable()
export class ZodSerializerInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const schema = this.reflector.get<ZodType>(SERIALIZE_KEY, context.getHandler());

    return next.handle().pipe(
      map((data) => {
        if (!schema) {
          return data;
        }

        return schema.parse(data);
      })
    );
  }
}
