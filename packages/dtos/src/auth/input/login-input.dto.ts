import z from 'zod';

export const signInInputSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

export type SignInInput = z.infer<typeof signInInputSchema>;
