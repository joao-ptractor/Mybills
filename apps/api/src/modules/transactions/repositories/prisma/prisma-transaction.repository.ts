import { Injectable } from '@nestjs/common';
import { Transaction as PrismaTransaction } from 'src/generated/prisma/client';
import { PrismaService } from 'src/modules/database/prisma/prisma.service';
import { CreateTransactionData } from '../../contracts/create-transaction-data.contract';
import { UpdateTransactionData } from '../../contracts/update-transaction-data.contract';
import { Transaction } from '../../entities/transaction.entity';
import { TransactionRepository } from '../transaction.repository';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(transaction: PrismaTransaction): Transaction {
    return {
      id: transaction.id,
      userId: transaction.userId,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      cardId: transaction.cardId,
      description: transaction.description,
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date.toISOString(),
      isPaid: transaction.isPaid,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString()
    };
  }

  async findAllByUserId(userId: string): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
    });

    return transactions.map((transaction) => this.mapToEntity(transaction));
  }

  async findByIdAndUserId(transactionId: string, userId: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId
      }
    });

    if (!transaction) {
      return null;
    }

    return this.mapToEntity(transaction);
  }

  async create(data: CreateTransactionData): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId: data.userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        cardId: data.cardId,
        description: data.description,
        type: data.type,
        amount: data.amount,
        date: new Date(data.date),
        isPaid: data.isPaid
      }
    });

    return this.mapToEntity(transaction);
  }

  async update(transactionId: string, data: UpdateTransactionData): Promise<Transaction> {
    const transaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        accountId: data.accountId,
        categoryId: data.categoryId,
        cardId: data.cardId,
        description: data.description,
        type: data.type,
        amount: data.amount,
        date: data.date ? new Date(data.date) : undefined
      }
    });

    return this.mapToEntity(transaction);
  }

  async updateIsPaid(transactionId: string, isPaid: boolean): Promise<Transaction> {
    const transaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { isPaid }
    });

    return this.mapToEntity(transaction);
  }

  async delete(transactionId: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id: transactionId }
    });
  }
}
