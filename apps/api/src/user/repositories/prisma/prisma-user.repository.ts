import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserRepository } from '../user.repository';
import { User } from '../../entities/user.entity';
import { User as PrismaUser } from 'src/generated/prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(user: PrismaUser): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken }
    });
  }

  async create(data: { name: string; email: string; hashedPassword: string }): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.hashedPassword
      }
    });

    return this.mapToEntity(user);
  }
}
