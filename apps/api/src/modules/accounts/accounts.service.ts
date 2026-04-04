import { Inject, Injectable } from '@nestjs/common';
import { InvalidArgumentError } from 'src/common/errors/invalid-argument.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { CreateAccountData } from './contracts/create-account-data.contract';
import { TransferBalanceData } from './contracts/transfer-balance-data.contract';
import { TransferBalanceResult } from './contracts/transfer-balance-result.contract';
import { UpdateAccountData } from './contracts/update-account-data.contract';
import { Account } from './entities/account.entity';
import { AccountRepository } from './repositories/account.repository';

@Injectable()
export class AccountsService {
  constructor(@Inject('AccountRepository') private readonly repository: AccountRepository) {}

  async findAll(userId: string): Promise<Account[]> {
    this.validateUserId(userId);

    return await this.repository.findAllByUserId(userId);
  }

  async findById(accountId: string, userId: string): Promise<Account> {
    this.validateAccountId(accountId);
    this.validateUserId(userId);

    const account = await this.repository.findByIdAndUserId(accountId, userId);

    if (!account) {
      throw new NotFoundError('Account not found');
    }

    return account;
  }

  async accountExistsForUser(accountId: string, userId: string): Promise<boolean> {
    this.validateAccountId(accountId);
    this.validateUserId(userId);

    const account = await this.repository.findByIdAndUserId(accountId, userId);

    return account !== null;
  }

  async create(data: CreateAccountData): Promise<Account> {
    this.validateCreateData(data);

    return await this.repository.create(data);
  }

  async transferBalance(data: TransferBalanceData): Promise<TransferBalanceResult> {
    this.validateTransferData(data);

    const sourceAccount = await this.repository.findByIdAndUserId(data.sourceAccountId, data.userId);

    if (!sourceAccount) {
      throw new NotFoundError('Source account not found');
    }

    const destinationAccount = await this.repository.findByIdAndUserId(
      data.destinationAccountId,
      data.userId
    );

    if (!destinationAccount) {
      throw new NotFoundError('Destination account not found');
    }

    if (sourceAccount.balance < data.amount) {
      throw new InvalidArgumentError('Insufficient account balance');
    }

    const transferResult = await this.repository.transferBalance(data);

    if (!transferResult) {
      throw new InvalidArgumentError('Transfer could not be completed');
    }

    return transferResult;
  }

  async update(accountId: string, userId: string, data: UpdateAccountData): Promise<Account> {
    this.validateAccountId(accountId);
    this.validateUserId(userId);
    this.validateUpdateData(data);

    await this.findById(accountId, userId);

    return await this.repository.update(accountId, data);
  }

  async remove(accountId: string, userId: string): Promise<void> {
    this.validateAccountId(accountId);
    this.validateUserId(userId);

    await this.findById(accountId, userId);
    await this.repository.delete(accountId);
  }

  private validateCreateData(data: CreateAccountData): void {
    this.validateUserId(data.userId);

    if (!data.name || typeof data.name !== 'string') {
      throw new InvalidArgumentError('Invalid account name');
    }

    if (!Number.isInteger(data.balance)) {
      throw new InvalidArgumentError('Invalid account balance');
    }
  }

  private validateUpdateData(data: UpdateAccountData): void {
    if (data.name === undefined && data.balance === undefined) {
      throw new InvalidArgumentError('At least one field must be provided');
    }

    if (data.name !== undefined && (!data.name || typeof data.name !== 'string')) {
      throw new InvalidArgumentError('Invalid account name');
    }

    if (data.balance !== undefined && !Number.isInteger(data.balance)) {
      throw new InvalidArgumentError('Invalid account balance');
    }
  }

  private validateTransferData(data: TransferBalanceData): void {
    this.validateUserId(data.userId);
    this.validateAccountId(data.sourceAccountId);
    this.validateAccountId(data.destinationAccountId);

    if (data.sourceAccountId === data.destinationAccountId) {
      throw new InvalidArgumentError('Source and destination accounts must be different');
    }

    if (!Number.isInteger(data.amount) || data.amount <= 0) {
      throw new InvalidArgumentError('Invalid transfer amount');
    }
  }

  private validateAccountId(accountId: string): void {
    if (!accountId || typeof accountId !== 'string') {
      throw new InvalidArgumentError('Invalid account id');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new InvalidArgumentError('Invalid user id');
    }
  }
}
