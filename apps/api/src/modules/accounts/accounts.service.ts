import { Inject, Injectable } from '@nestjs/common';
import { InvalidArgumentError } from 'src/common/errors/invalid-argument.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { CreateAccountData } from './contracts/create-account-data.contract';
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

  async create(data: CreateAccountData): Promise<Account> {
    this.validateCreateData(data);

    return await this.repository.create(data);
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
