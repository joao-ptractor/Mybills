---
applyTo: "apps/api/prisma/**"
---

# Database — Prisma Conventions

## Schema Conventions

### Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Model names | PascalCase singular | `Account`, `Transaction`, `CreditCard` |
| Table names (via `@@map`) | snake_case plural | `accounts`, `transactions`, `credit_cards` |
| Field names | camelCase | `userId`, `initialBalance`, `deletedAt` |
| Column names (via `@map`) | snake_case | `user_id`, `initial_balance`, `deleted_at` |

Always use `@map` and `@@map` to keep Prisma models idiomatic TypeScript while the DB uses snake_case:

```prisma
model CreditCard {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  name      String
  limit     Int      @map("credit_limit")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  user User @relation(fields: [userId], references: [id])

  @@map("credit_cards")
}
```

## Required Fields on Every Model

Every model **must** have these fields:

```prisma
id        String    @id @default(uuid())
createdAt DateTime  @default(now()) @map("created_at")
updatedAt DateTime  @updatedAt @map("updated_at")
deletedAt DateTime? @map("deleted_at")   // soft delete
```

- Never auto-increment IDs exposed to clients. Use `uuid()`.
- `deletedAt` is always nullable — `null` means the record is active.

## Monetary Fields

- Store all monetary amounts as `Int` (integer, in cents). Never `Float`.
- Use `Decimal` only for non-monetary numeric precision (e.g., investment unit quantities, exchange rates).
- Field names for amounts end with the word that clarifies the unit: `balanceCents`, `amountCents`, `limitCents`.

```prisma
// CORRECT
model Account {
  balanceCents Int @map("balance_cents")
}

// WRONG — never use Float for money
model Account {
  balance Float
}
```

## Soft Deletes

- **Never hard-delete financial records** (accounts, transactions, invoices, investments, cards).
- Soft delete by setting `deletedAt = new Date()`.
- All repository queries that list records must filter `deletedAt: null`.
- Only system configuration records (e.g., categories, tags) may allow hard deletes.

## Relations

- Name relation fields clearly: use the related model name in camelCase.
- Always define both sides of a relation.
- Use `onDelete: Restrict` for financial records — prevent accidental cascade deletes.

```prisma
model Transaction {
  id        String  @id @default(uuid())
  accountId String  @map("account_id")
  account   Account @relation(fields: [accountId], references: [id], onDelete: Restrict)
}
```

## Enums

- Define Prisma enums for fields with a fixed set of values.
- Enum values in SCREAMING_SNAKE_CASE.

```prisma
enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}

enum AccountType {
  CHECKING
  SAVINGS
  INVESTMENT
  WALLET
}
```

## Migrations

- **Never edit migration files after they are applied.**
- Always run `npx prisma migrate dev --name <description>` to create new migrations.
- Migration names use kebab-case and describe the change: `add-soft-delete-to-transactions`, `create-investments-table`.
- Run `npx prisma generate` after any schema change to update the Prisma Client.
- Never use `prisma db push` in production — always use versioned migrations.

## PrismaService

- `PrismaService` extends `PrismaClient` and is provided globally via `PrismaModule`.
- Only inject `PrismaService` in `*.repository.ts` files.
- Handle `PrismaClientKnownRequestError` in the repository layer and translate to domain errors.

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

async create(data: CreateAccountData): Promise<Account> {
  try {
    return await this.prisma.account.create({ data });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('Account name already exists');
    }
    throw e;
  }
}
```

## Domain Model Reference (planned entities)

```
User
Account        (userId, type: AccountType, name, balanceCents)
CreditCard     (userId, name, limitCents, closingDay, dueDay)
Invoice        (cardId, month, year, totalCents, status)
Transaction    (userId, accountId?, cardId?, type, amountCents, date, description, categoryId)
Category       (userId, name, color, icon, type)
Investment     (userId, name, type, brokerName, quantity: Decimal, avgPriceCents)
InvestmentEvent (investmentId, type, quantity: Decimal, priceCents, date)
```
