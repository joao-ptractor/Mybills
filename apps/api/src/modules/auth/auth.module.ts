import { Module } from '@nestjs/common';
import { UserModule } from '../user/users.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaUserRepository } from '../user/repositories/prisma/prisma-user.repository';

@Module({
  imports: [ConfigModule, UserModule, DatabaseModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository
    },
    AuthService
  ]
})
export class AuthModule {}
