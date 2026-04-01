import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';
import { ZodType } from 'zod';
import { ZodSerializerInterceptor } from '../interceptors/zod-serializer.interceptor';

export const SERIALIZE_KEY = 'serialize_schema';

export function Serialize(schema: ZodType) {
  return applyDecorators(
    SetMetadata(SERIALIZE_KEY, schema),
    UseInterceptors(ZodSerializerInterceptor)
  );
}
