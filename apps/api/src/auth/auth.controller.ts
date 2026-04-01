import { Body, Controller, Post, UsePipes, HttpCode, HttpStatus } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Serialize(signUpOutputSchema)
  @UsePipes(new ZodValidationPipe(signUpInputSchema))
  async register(@Body() data: SignUpInput): Promise<SignUpOutput> {
    return this.authService.signUp(data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Serialize(signInOutputSchema)
  @UsePipes(new ZodValidationPipe(signInInputSchema))
  async login(@Body() data: SignInInput): Promise<SignInOutput> {
    return this.authService.signIn(data);
  }
}
