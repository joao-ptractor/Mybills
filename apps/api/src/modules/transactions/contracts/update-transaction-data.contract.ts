import { TransactionType } from 'src/generated/prisma/client';

export interface UpdateTransactionData {
  accountId?: string | null;
  categoryId?: string | null;
  cardId?: string | null;
  description?: string | null;
  type?: TransactionType;
  amount?: number;
  date?: string;
}
