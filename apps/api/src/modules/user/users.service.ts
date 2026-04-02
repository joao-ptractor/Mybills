import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { CreateUserData } from './contracts/create-user-data.contract';

@Injectable()
export class UsersService {
  constructor(@Inject('UserRepository') private readonly repository: UserRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findByEmail(email);
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.repository.updateRefreshToken(userId, refreshToken);
  }

  async create(data: CreateUserData): Promise<User> {
    return await this.repository.create(data);
  }
}
