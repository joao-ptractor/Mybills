import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaUserRepository } from './repositories/prisma/prisma-user.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository
    }
  ]
})
export class UserModule {}
