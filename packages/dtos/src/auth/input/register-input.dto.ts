import z from 'zod';

export const signUpInputSchema = z.object({
  email: z.email('Invalid email'),
  name: z.string('Invalid name'),
  password: z
    .string('Invalid password')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number'
    )
});

export type SignUpInput = z.infer<typeof signUpInputSchema>;
