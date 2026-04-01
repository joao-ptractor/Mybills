import z from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.url(),
  ACCESS_TOKEN_SECRET: z.string().min(10, 'Access token key must contain at least 10 characters'),
  REFRESH_TOKEN_SECRET: z.string().min(10, 'Refresh token key must contain at least 10 characters')
});

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}
