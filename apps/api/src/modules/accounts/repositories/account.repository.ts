import { CreateAccountData } from '../contracts/create-account-data.contract';
import { TransferBalanceData } from '../contracts/transfer-balance-data.contract';
import { TransferBalanceResult } from '../contracts/transfer-balance-result.contract';
import { UpdateAccountData } from '../contracts/update-account-data.contract';
import { Account } from '../entities/account.entity';

export interface AccountRepository {
  findAllByUserId(userId: string): Promise<Account[]>;
  findByIdAndUserId(accountId: string, userId: string): Promise<Account | null>;
  create(data: CreateAccountData): Promise<Account>;
  transferBalance(data: TransferBalanceData): Promise<TransferBalanceResult | null>;
  update(accountId: string, data: UpdateAccountData): Promise<Account>;
  delete(accountId: string): Promise<void>;
}
