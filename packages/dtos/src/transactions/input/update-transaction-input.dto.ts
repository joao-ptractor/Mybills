import z from 'zod';
import { transactionTypeSchema } from './create-transaction-input.dto';

export const updateTransactionInputSchema = z
  .object({
    accountId: z.uuid('Invalid account id').nullable().optional(),
    categoryId: z.uuid('Invalid category id').nullable().optional(),
    cardId: z.uuid('Invalid credit card id').nullable().optional(),
    description: z.string('Invalid description').trim().nullable().optional(),
    type: transactionTypeSchema.optional(),
    amount: z.int('Invalid amount').positive('Amount must be greater than zero').optional(),
    date: z.iso.date('Invalid date').optional()
  })
  .refine(
    (data) =>
      data.accountId !== undefined ||
      data.categoryId !== undefined ||
      data.cardId !== undefined ||
      data.description !== undefined ||
      data.type !== undefined ||
      data.amount !== undefined ||
      data.date !== undefined,
    {
      message: 'At least one field must be provided'
    }
  );

export type UpdateTransactionInput = z.infer<typeof updateTransactionInputSchema>;
