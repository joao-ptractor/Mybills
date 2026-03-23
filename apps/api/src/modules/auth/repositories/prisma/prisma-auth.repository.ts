import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../auth.repository';
import { PrismaService } from 'src/modules/database/prisma/prisma.service';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateRefreshToken(userId: string, hashedRefreshToken: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken }
    });
  }
}
