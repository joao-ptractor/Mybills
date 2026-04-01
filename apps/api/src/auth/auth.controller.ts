import { Body, Controller, Post, UsePipes, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Serialize } from '../common/decorators/serialize.decorator';
import {
  signUpInputSchema,
  signInInputSchema,
  SignUpInput,
  SignInInput,
  signUpOutputSchema,
  signInOutputSchema,
  SignUpOutput,
  SignInOutput
} from '@mybills/dtos';
import { toJSONSchema } from 'zod';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Creates a new user',
    description: 'Creates a new user with the provided data.'
  })
  @ApiBody({
    schema: toJSONSchema(signUpInputSchema) as SchemaObject,
    description: 'User registration data'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully.',
    schema: toJSONSchema(signUpOutputSchema) as SchemaObject
  })
  @Serialize(signUpOutputSchema)
  @UsePipes(new ZodValidationPipe(signUpInputSchema))
  async register(@Body() data: SignUpInput): Promise<SignUpOutput> {
    return this.authService.signUp(data);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login', description: 'Authenticates a user and returns a JWT token.' })
  @ApiBody({
    schema: toJSONSchema(signInInputSchema) as SchemaObject,
    description: 'User login credentials'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User authenticated successfully.',
    schema: toJSONSchema(signInOutputSchema) as SchemaObject
  })
  @Serialize(signInOutputSchema)
  @UsePipes(new ZodValidationPipe(signInInputSchema))
  async login(@Body() data: SignInInput): Promise<SignInOutput> {
    return this.authService.signIn(data);
  }
}
