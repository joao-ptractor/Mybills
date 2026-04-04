import z from 'zod';

export const updateTransactionIsPaidInputSchema = z.object({
  isPaid: z.boolean('Invalid paid status')
});

export type UpdateTransactionIsPaidInput = z.infer<typeof updateTransactionIsPaidInputSchema>;
