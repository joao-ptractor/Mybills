import { z } from 'zod';

export const signUpOutputSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type SignUpOutput = z.infer<typeof signUpOutputSchema>;
