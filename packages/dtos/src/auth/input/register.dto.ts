import z from 'zod';

export const signUpInput = z.object({
  email: z.email('Email inválido'),
  name: z.string('Nome inválido'),
  password: z
    .string('Senha inválida')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      'Senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula e um número'
    )
});

export type SignUpInput = z.infer<typeof signUpInput>;
