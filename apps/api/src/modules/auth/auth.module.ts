import { Module } from '@nestjs/common';
import { UserModule } from '../user/users.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { PrismaAuthRepository } from './repositories/prisma/prisma-auth.repository';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, DatabaseModule, JwtModule.register({})],
  controllers: [],
  providers: [
    {
      provide: 'AuthRepository',
      useClass: PrismaAuthRepository
    },
    AuthService
  ]
})
export class AuthModule {}
