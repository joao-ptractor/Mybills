import z from 'zod';

export const updateAccountInputSchema = z
  .object({
    name: z.string('Invalid name').trim().min(1, 'Name is required').optional(),
    balance: z.int('Invalid balance').optional()
  })
  .refine((data) => data.name !== undefined || data.balance !== undefined, {
    message: 'At least one field must be provided'
  });

export type UpdateAccountInput = z.infer<typeof updateAccountInputSchema>;
