import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { validate } from '../config/env.validation';
import { UserModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { DomainErrorFilter } from '../common/filters/domain-error.filter';
import { PrismaClientExceptionFilter } from '../common/filters/prisma-client-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validate,
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
    }),
    UserModule,
    AuthModule,
    AccountsModule,
    CreditCardsModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: DomainErrorFilter
    }
  ]
})
export class AppModule {}
