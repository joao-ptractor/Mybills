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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Cria um novo usuário',
    description: 'Cria um novo usuário com os dados fornecidos.'
  })
  @ApiBody({
    schema: toJSONSchema(signUpInputSchema) as SchemaObject,
    description: 'Dados de registro do usuário'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso.',
    schema: toJSONSchema(signUpOutputSchema) as SchemaObject
  })
  @Serialize(signUpOutputSchema)
  @UsePipes(new ZodValidationPipe(signUpInputSchema))
  async register(@Body() data: SignUpInput): Promise<SignUpOutput> {
    return this.authService.signUp(data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login', description: 'Autentica um usuário e retorna um token JWT.' })
  @ApiBody({
    schema: toJSONSchema(signInInputSchema) as SchemaObject,
    description: 'Credenciais de login do usuário'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário autenticado com sucesso.',
    schema: toJSONSchema(signInOutputSchema) as SchemaObject
  })
  @Serialize(signInOutputSchema)
  @UsePipes(new ZodValidationPipe(signInInputSchema))
  async login(@Body() data: SignInInput): Promise<SignInOutput> {
    return this.authService.signIn(data);
  }
}
