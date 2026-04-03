import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/modules/app.module';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import {
  signInOutputSchema,
  signUpOutputSchema,
  SignInInput,
  SignInOutput,
  SignUpInput,
  SignUpOutput
} from '@mybills/dtos';
import { UsersService } from 'src/modules/user/users.service';
import { User } from 'src/modules/user/entities/user.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let usersService: UsersService;

  function parseSignUpOutput(body: object): SignUpOutput {
    return signUpOutputSchema.parse(body);
  }

  function parseSignInOutput(body: object): SignInOutput {
    return signInOutputSchema.parse(body);
  }

  function getPersistedRefreshToken(user: User | null): string {
    if (!user?.refreshToken) {
      throw new Error('Expected persisted refresh token to exist');
    }

    return user.refreshToken;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    usersService = app.get(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user and return tokens', async () => {
    const payload: SignUpInput = {
      name: 'teste',
      email: 'teste@mybills.dev',
      password: 'Teste123'
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);
    const registerOutput = parseSignUpOutput(response.body as object);

    expect(registerOutput).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String)
    });

    const createdUser: User | null = await usersService.findByEmail(payload.email);

    expect(createdUser).not.toBeNull();
    expect(createdUser?.password).not.toBe(payload.password);
    expect(createdUser?.refreshToken).toBeTruthy();
    expect(createdUser?.refreshToken).not.toBe(registerOutput.refreshToken);

    const persistedRefreshToken = getPersistedRefreshToken(createdUser);

    const isRefreshTokenHashed = await bcrypt.compare(
      registerOutput.refreshToken,
      persistedRefreshToken
    );
    expect(isRefreshTokenHashed).toBe(true);
  });

  it('should not allow duplicate email registration', async () => {
    const payload: SignUpInput = {
      name: 'teste duplicado',
      email: 'teste-duplicado@mybills.dev',
      password: 'Teste123'
    };

    await request(app.getHttpServer()).post('/auth/register').send(payload).expect(201);

    const duplicateResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(409);

    expect(duplicateResponse.body).toMatchObject({
      statusCode: 409,
      message: 'Email already registered',
      error: 'already_exists'
    });
  });

  it('should validate register payload', async () => {
    const invalidPayload = {
      name: 'Invalid User',
      email: 'invalid-email',
      password: '123'
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(invalidPayload)
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Validation failed'
    });
    expect(response.body.errors).toBeDefined();
  });

  it('should login with valid credentials and return tokens', async () => {
    const payload: SignUpInput = {
      name: 'Login User',
      email: 'login-success@mybills.dev',
      password: 'Teste123'
    };

    await request(app.getHttpServer()).post('/auth/register').send(payload).expect(201);

    const loginPayload: SignInInput = {
      email: payload.email,
      password: payload.password
    };

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginPayload)
      .expect(200);
    const loginOutput = parseSignInOutput(loginResponse.body as object);

    expect(loginOutput).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String)
    });

    const user: User | null = await usersService.findByEmail(payload.email);

    expect(user?.refreshToken).toBeTruthy();

    const persistedRefreshToken = getPersistedRefreshToken(user);

    const isRefreshTokenUpdated = await bcrypt.compare(
      loginOutput.refreshToken,
      persistedRefreshToken
    );
    expect(isRefreshTokenUpdated).toBe(true);
  });

  it('should return not found when login password is invalid', async () => {
    const payload: SignUpInput = {
      name: 'Wrong Password User',
      email: 'wrong-password@mybills.dev',
      password: 'StrongPass123'
    };

    await request(app.getHttpServer()).post('/auth/register').send(payload).expect(201);

    const invalidLoginPayload: SignInInput = {
      email: payload.email,
      password: 'WrongPass123'
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(invalidLoginPayload)
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      message: 'Invalid email or password',
      error: 'not_found'
    });
  });

  it('should return not found when login user does not exist', async () => {
    const payload: SignInInput = {
      email: 'not-found-user@mybills.dev',
      password: 'StrongPass123'
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(payload)
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      message: 'Invalid email or password',
      error: 'not_found'
    });
  });

  it('should validate login payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'invalid-email',
        password: ''
      })
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Validation failed'
    });
    expect(response.body.errors).toBeDefined();
  });
});
