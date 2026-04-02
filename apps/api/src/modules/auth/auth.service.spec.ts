import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InvalidArgumentError } from 'src/common/errors/invalid-argument.error';
import { AlreadyExistsError } from 'src/common/errors/already-exists.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

jest.mock('argon2');
jest.mock('bcrypt');

const mockedArgon2 = argon2 as jest.Mocked<typeof argon2>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 'user-123',
    name: 'João',
    email: 'joao@example.com',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            updateRefreshToken: jest.fn(),
            create: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn()
          }
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;

    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a new user and return tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      mockedArgon2.hash.mockImplementation(async () => 'hashed-password');
      mockedBcrypt.hash.mockImplementation(async () => 'hashed-refresh-token');

      const result = await authService.signUp({
        name: 'João',
        email: 'joao@example.com',
        password: 'password123'
      });

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(usersService.create).toHaveBeenCalledWith({
        name: 'João',
        email: 'joao@example.com',
        hashedPassword: 'hashed-password'
      });
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        'user-123',
        'hashed-refresh-token'
      );
    });

    it('should throw AlreadyExistsError if email is already taken', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.signUp({
          name: 'João',
          email: 'joao@example.com',
          password: 'password123'
        })
      ).rejects.toThrow(AlreadyExistsError);
    });

    it('should throw InvalidArgumentError if missing data', async () => {
      await expect(
        authService.signUp({
          name: '',
          email: 'joao@example.com',
          password: 'password123'
        })
      ).rejects.toThrow(InvalidArgumentError);
    });
  });

  describe('signIn', () => {
    it('should successfully sign in and return tokens', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      mockedArgon2.verify.mockImplementation(async () => true);

      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      mockedBcrypt.hash.mockImplementation(async () => 'hashed-refresh-token');

      const result = await authService.signIn({
        email: 'joao@example.com',
        password: 'password123'
      });

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        'user-123',
        'hashed-refresh-token'
      );
    });

    it('should throw NotFoundError if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.signIn({
          email: 'joao@example.com',
          password: 'password123'
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      mockedArgon2.verify.mockImplementation(async () => false);

      await expect(
        authService.signIn({
          email: 'joao@example.com',
          password: 'wrongpassword'
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw InvalidArgumentError if missing data', async () => {
      await expect(
        authService.signIn({
          email: '',
          password: 'password123'
        })
      ).rejects.toThrow(InvalidArgumentError);
    });
  });
});
