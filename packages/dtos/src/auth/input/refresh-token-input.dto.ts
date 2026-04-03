import z from 'zod';

export const refreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export type RefreshTokenInput = z.infer<typeof refreshTokenInputSchema>;