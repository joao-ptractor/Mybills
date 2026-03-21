---
applyTo: 'apps/api/prisma/**'
---

# Database — Prisma Conventions

## Schema Conventions

### Naming

| Element                   | Convention          | Example                                    |
| ------------------------- | ------------------- | ------------------------------------------ |
| Model names               | PascalCase singular | `Account`, `Transaction`, `CreditCard`     |
| Table names (via `@@map`) | snake_case plural   | `accounts`, `transactions`, `credit_cards` |
| Field names               | camelCase           | `userId`, `initialBalance`, `deletedAt`    |
| Column names (via `@map`) | snake_case          | `user_id`, `initial_balance`, `deleted_at` |

Always use `@map` and `@@map` to keep Prisma models idiomatic TypeScript while the DB uses snake_case:

## Monetary Fields

- Store all monetary amounts as `Int` (integer, in cents). Never `Float`.
- Use `Decimal` only for non-monetary numeric precision (e.g., investment unit quantities, exchange rates).
- Field names for amounts end with the word that clarifies the unit: `balanceCents`, `amountCents`, `limitCents`.``

## Soft Deletes

- **Never hard-delete financial records** (accounts, transactions, invoices, investments, cards).
- Soft delete by setting `deletedAt = new Date()`.
- All repository queries that list records must filter `deletedAt: null`.
- Only system configuration records (e.g., categories, tags) may allow hard deletes.

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
