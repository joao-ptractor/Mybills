import { User } from '../entities/user.entity';

export interface UserRepository {
  updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  create(data: { name: string; email: string; hashedPassword: string }): Promise<User>;
}
