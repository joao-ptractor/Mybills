import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@Inject('UserRepository') private readonly repository: UserRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findByEmail(email);
  }
}
