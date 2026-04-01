import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/modules/database/database.module';
import { PrismaUserRepository } from './repositories/prisma/prisma-user.repository';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository
    },
    UsersService
  ],
  exports: [UsersService, 'UserRepository']
})
export class UserModule {}
