import z from 'zod';
import { accountOutputSchema } from './account-output.dto';

export const transferBalanceOutputSchema = z.object({
  sourceAccount: accountOutputSchema,
  destinationAccount: accountOutputSchema
});

export type TransferBalanceOutput = z.infer<typeof transferBalanceOutputSchema>;
