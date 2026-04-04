export interface CreateCreditCardData {
  accountId: string;
  userId: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
}