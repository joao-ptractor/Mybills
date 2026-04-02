import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.validation';
import { SignUpData } from './contracts/sign-up-data.contract';
import { InvalidArgumentError } from 'src/common/errors/invalid-argument.error';
import { AlreadyExistsError } from 'src/common/errors/already-exists.error';
import * as argon2 from 'argon2';
import { SignInData } from './contracts/sign-in-data.contract';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { JwtPayload } from './contracts/jwt-payload.contract';
import { UsersService } from '../user/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env>
  ) {}

  private async getTokens(userId: string, email: string) {
    const jwtPayload: JwtPayload = { sub: userId, email };

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

    await this.usersService.updateRefreshToken(userId, hash);
  }

  async signUp(data: SignUpData) {
    if (!data.email || typeof data.email !== 'string') {
      throw new InvalidArgumentError('Invalid email');
    }
    if (!data.name || typeof data.name !== 'string') {
      throw new InvalidArgumentError('Invalid name');
    }
    if (!data.password || typeof data.password !== 'string') {
      throw new InvalidArgumentError('Invalid password');
    }

    const user = await this.usersService.findByEmail(data.email);
    if (user) {
      throw new AlreadyExistsError('Email already registered');
    }

    const hashedPassword = await argon2.hash(data.password);

    const createdUser = await this.usersService.create({
      name: data.name,
      email: data.email,
      hashedPassword
    });

    const tokens = await this.getTokens(createdUser.id, createdUser.email);

    await this.updateRefreshToken(createdUser.id, tokens.refreshToken);

    return tokens;
  }

  async signIn(data: SignInData) {
    if (!data.email || typeof data.email !== 'string') {
      throw new InvalidArgumentError('Invalid email');
    }
    if (!data.password || typeof data.password !== 'string') {
      throw new InvalidArgumentError('Invalid password');
    }

    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new NotFoundError('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(user.password, data.password);
    if (!isPasswordValid) {
      throw new NotFoundError('Invalid email or password');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
