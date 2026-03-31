import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.validation';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private configService: ConfigService<Env>) {
    const adapter = new PrismaPg({
      connectionString: configService.get('DATABASE_URL')
    });
    super({ adapter });
  }
}
