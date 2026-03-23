import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        refreshToken: true
      }
    });
  }
}
