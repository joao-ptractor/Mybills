import { Account } from '../entities/account.entity';

export interface TransferBalanceResult {
  sourceAccount: Account;
  destinationAccount: Account;
}