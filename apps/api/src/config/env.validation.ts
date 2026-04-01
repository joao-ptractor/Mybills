import z from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.url(),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(10, 'Chave para o token de acesso deve conter no mínimo 10 caracteres'),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(10, 'Chave para o token de atualização deve conter no mínimo 10 caracteres')
});

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Variáveis de ambiente inválidas:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}
