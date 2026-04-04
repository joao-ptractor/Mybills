import z from 'zod';

export const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE', 'TRANSFER']);

export const createTransactionInputSchema = z.object({
  accountId: z.uuid('Invalid account id').nullable().optional(),
  categoryId: z.uuid('Invalid category id').nullable().optional(),
  cardId: z.uuid('Invalid credit card id').nullable().optional(),
  description: z.string('Invalid description').trim().nullable().optional(),
  type: transactionTypeSchema,
  amount: z.int('Invalid amount').positive('Amount must be greater than zero'),
  date: z.iso.date('Invalid date'),
  isPaid: z.boolean('Invalid paid status').default(false)
});

export type CreateTransactionInput = z.infer<typeof createTransactionInputSchema>;
