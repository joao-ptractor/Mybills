import z from 'zod';

export const transferBalanceInputSchema = z.object({
  sourceAccountId: z.uuid('Invalid source account id'),
  destinationAccountId: z.uuid('Invalid destination account id'),
  amount: z.int('Invalid transfer amount').positive('Transfer amount must be greater than zero')
});

export type TransferBalanceInput = z.infer<typeof transferBalanceInputSchema>;