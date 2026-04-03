import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  SignUpInput,
  SignInInput,
  SignUpOutput,
  SignInOutput,
  RefreshTokenInput,
  RefreshTokenOutput
} from '@mybills/dtos';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
            refreshTokens: jest.fn()
          }
        }
      ]
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  describe('register', () => {
    it('should call authService.signUp with correct data and return tokens', async () => {
      const input: SignUpInput = {
        name: 'João',
        email: 'joao@example.com',
        password: 'password123'
      };

      const output: SignUpOutput = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      authService.signUp.mockResolvedValue(output);

      const result = await authController.register(input);

      expect(result).toEqual(output);
      expect(authService.signUp).toHaveBeenCalledTimes(1);
      expect(authService.signUp).toHaveBeenCalledWith(input);
    });
  });

  describe('login', () => {
    it('should call authService.signIn with correct data and return tokens', async () => {
      const input: SignInInput = {
        email: 'joao@example.com',
        password: 'password123'
      };

      const output: SignInOutput = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      authService.signIn.mockResolvedValue(output);

      const result = await authController.login(input);

      expect(result).toEqual(output);
      expect(authService.signIn).toHaveBeenCalledTimes(1);
      expect(authService.signIn).toHaveBeenCalledWith(input);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshTokens with correct data and return rotated tokens', async () => {
      const input: RefreshTokenInput = {
        refreshToken: 'refresh-token'
      };

      const output: RefreshTokenOutput = {
        accessToken: 'access-token',
        refreshToken: 'new-refresh-token'
      };

      authService.refreshTokens.mockResolvedValue(output);

      const result = await authController.refresh(input);

      expect(result).toEqual(output);
      expect(authService.refreshTokens).toHaveBeenCalledTimes(1);
      expect(authService.refreshTokens).toHaveBeenCalledWith(input);
    });
  });
});
