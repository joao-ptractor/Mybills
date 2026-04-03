import z from 'zod';

export const refreshTokenOutputSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});

export type RefreshTokenOutput = z.infer<typeof refreshTokenOutputSchema>;