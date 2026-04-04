import z from 'zod';

export const updateCreditCardInputSchema = z
  .object({
    accountId: z.uuid('Invalid account id').optional(),
    name: z.string('Invalid name').trim().min(1, 'Name is required').optional(),
    limit: z.int('Invalid limit').optional(),
    closingDay: z.int('Invalid closing day').optional(),
    dueDay: z.int('Invalid due day').optional()
  })
  .refine(
    (data) =>
      data.accountId !== undefined ||
      data.name !== undefined ||
      data.limit !== undefined ||
      data.closingDay !== undefined ||
      data.dueDay !== undefined,
    {
      message: 'At least one field must be provided'
    }
  );

export type UpdateCreditCardInput = z.infer<typeof updateCreditCardInputSchema>;