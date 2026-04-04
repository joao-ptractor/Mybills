import { Inject, Injectable } from '@nestjs/common';
import { InvalidArgumentError } from 'src/common/errors/invalid-argument.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { AccountsService } from '../accounts/accounts.service';
import { CreateCreditCardData } from './contracts/create-credit-card-data.contract';
import { UpdateCreditCardData } from './contracts/update-credit-card-data.contract';
import { CreditCard } from './entities/credit-card.entity';
import { CreditCardRepository } from './repositories/credit-card.repository';

@Injectable()
export class CreditCardsService {
  constructor(
    @Inject('CreditCardRepository') private readonly repository: CreditCardRepository,
    private readonly accountsService: AccountsService
  ) {}

  async findAll(userId: string): Promise<CreditCard[]> {
    this.validateUserId(userId);

    return await this.repository.findAllByUserId(userId);
  }

  async findById(creditCardId: string, userId: string): Promise<CreditCard> {
    this.validateCreditCardId(creditCardId);
    this.validateUserId(userId);

    const creditCard = await this.repository.findByIdAndUserId(creditCardId, userId);

    if (!creditCard) {
      throw new NotFoundError('Credit card not found');
    }

    return creditCard;
  }

  async create(data: CreateCreditCardData): Promise<CreditCard> {
    this.validateCreateData(data);

    const accountExists = await this.accountsService.accountExistsForUser(data.accountId, data.userId);

    if (!accountExists) {
      throw new NotFoundError('Account not found');
    }

    return await this.repository.create(data);
  }

  async update(
    creditCardId: string,
    userId: string,
    data: UpdateCreditCardData
  ): Promise<CreditCard> {
    this.validateCreditCardId(creditCardId);
    this.validateUserId(userId);
    this.validateUpdateData(data);

    await this.findById(creditCardId, userId);

    if (data.accountId !== undefined) {
      const accountExists = await this.accountsService.accountExistsForUser(data.accountId, userId);

      if (!accountExists) {
        throw new NotFoundError('Account not found');
      }
    }

    return await this.repository.update(creditCardId, {
      accountId: data.accountId,
      name: data.name,
      limit: data.limit,
      closingDay: data.closingDay,
      dueDay: data.dueDay
    });
  }

  async remove(creditCardId: string, userId: string): Promise<void> {
    this.validateCreditCardId(creditCardId);
    this.validateUserId(userId);

    await this.findById(creditCardId, userId);
    await this.repository.delete(creditCardId);
  }

  private validateCreateData(data: CreateCreditCardData): void {
    this.validateUserId(data.userId);
    this.validateAccountId(data.accountId);

    if (!data.name || typeof data.name !== 'string') {
      throw new InvalidArgumentError('Invalid credit card name');
    }

    if (!Number.isInteger(data.limit)) {
      throw new InvalidArgumentError('Invalid credit card limit');
    }

    if (!Number.isInteger(data.closingDay)) {
      throw new InvalidArgumentError('Invalid credit card closing day');
    }

    if (!Number.isInteger(data.dueDay)) {
      throw new InvalidArgumentError('Invalid credit card due day');
    }
  }

  private validateUpdateData(data: UpdateCreditCardData): void {
    if (
      data.accountId === undefined &&
      data.name === undefined &&
      data.limit === undefined &&
      data.closingDay === undefined &&
      data.dueDay === undefined
    ) {
      throw new InvalidArgumentError('At least one field must be provided');
    }

    if (data.accountId !== undefined) {
      this.validateAccountId(data.accountId);
    }

    if (data.name !== undefined && (!data.name || typeof data.name !== 'string')) {
      throw new InvalidArgumentError('Invalid credit card name');
    }

    if (data.limit !== undefined && !Number.isInteger(data.limit)) {
      throw new InvalidArgumentError('Invalid credit card limit');
    }

    if (data.closingDay !== undefined && !Number.isInteger(data.closingDay)) {
      throw new InvalidArgumentError('Invalid credit card closing day');
    }

    if (data.dueDay !== undefined && !Number.isInteger(data.dueDay)) {
      throw new InvalidArgumentError('Invalid credit card due day');
    }
  }

  private validateCreditCardId(creditCardId: string): void {
    if (!creditCardId || typeof creditCardId !== 'string') {
      throw new InvalidArgumentError('Invalid credit card id');
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
