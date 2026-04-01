import { z } from 'zod';

export const signInOutputSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type SignInOutput = z.infer<typeof signInOutputSchema>;
