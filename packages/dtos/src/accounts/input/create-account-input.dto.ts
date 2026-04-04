import z from 'zod';

export const createAccountInputSchema = z.object({
  name: z.string('Invalid name').trim().min(1, 'Name is required'),
  balance: z.int('Invalid balance').default(0)
});

export type CreateAccountInput = z.infer<typeof createAccountInputSchema>;
