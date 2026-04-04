import z from 'zod';

export const createCreditCardInputSchema = z.object({
  accountId: z.uuid('Invalid account id'),
  name: z.string('Invalid name').trim().min(1, 'Name is required'),
  limit: z.int('Invalid limit'),
  closingDay: z.int('Invalid closing day'),
  dueDay: z.int('Invalid due day')
});

export type CreateCreditCardInput = z.infer<typeof createCreditCardInputSchema>;