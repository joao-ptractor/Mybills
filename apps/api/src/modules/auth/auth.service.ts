import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.validation';
import { SignUpData } from './contracts/sign-up-data.contract';
import { InvalidArgumentError } from 'src/common/errors/invalid-argument.error';
import { AlreadyExistsError } from 'src/common/errors/already-exists.error';
import { UserRepository } from '../user/repositories/user.repository';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository') private readonly repository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env>
  ) {}

  private async getTokens(userId: string, email: string) {
    const jwtPayload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
        expiresIn: '15m'
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d'
      })
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);

    await this.repository.updateRefreshToken(userId, hash);
  }

  async signUp(data: SignUpData) {
    if (!data.email || typeof data.email !== 'string') {
      throw new InvalidArgumentError('Email inválido');
    }
    if (!data.name || typeof data.name !== 'string') {
      throw new InvalidArgumentError('Nome inválido');
    }
    if (!data.password || typeof data.password !== 'string') {
      throw new InvalidArgumentError('Senha inválida');
    }

    const user = await this.repository.findByEmail(data.email);
    if (user) {
      throw new AlreadyExistsError('Email já cadastrado');
    }

    const hashedPassword = await argon2.hash(data.password);

    const createdUser = await this.repository.create({
      name: data.name,
      email: data.email,
      hashedPassword
    });

    const tokens = await this.getTokens(createdUser.id, createdUser.email);

    await this.updateRefreshToken(createdUser.id, tokens.refreshToken);

    return tokens;
  }
}
