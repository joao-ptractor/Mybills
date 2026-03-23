import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UserRepository) {}

  async findByEmail(email: string) {
    return await this.repository.findByEmail(email);
  }
}
