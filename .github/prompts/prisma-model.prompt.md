---
agent: agent
description: Add a new Prisma model with repository class, following MyBills database conventions
---

# Add a New Prisma Model

Generate a new Prisma model and its corresponding Repository class following the MyBills database conventions.

## Input

**Model name**: [PROVIDE THE MODEL NAME — e.g., `Account`, `Transaction`, `Investment`]
**Fields**: [DESCRIBE THE FIELDS — e.g., name: string, balanceCents: integer, type: enum(CHECKING/SAVINGS)]
**Relations**: [DESCRIBE RELATIONS — e.g., belongs to User, has many Transactions]

## What to Generate

### 1. Prisma Schema Block (add to `apps/api/prisma/schema.prisma`)

Follow all conventions strictly:

```prisma
model <ModelName> {
  // Always include:
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Domain fields (snake_case @map for all):
  // name      String
  // amountCents Int @map("amount_cents")  ← amounts are always Int in cents

  // Relations:
  user User @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@map("<table_name_plural_snake_case>")
}
```

### 2. Enums (if needed — add before model in schema.prisma)

```prisma
enum <ModelName>Type {
  VALUE_ONE
  VALUE_TWO
}
```

### 3. Repository Class (`apps/api/src/<module>/<module>.repository.ts`)

Generate a complete repository with:

- `findAllByUserId(userId: string)` — filters `deletedAt: null`
- `findById(id: string, userId: string)` — filters both id and userId and `deletedAt: null`
- `create(data: Create<Model>Data)` — wraps `prisma.<model>.create`
- `update(id: string, userId: string, data: Update<Model>Data)` — wraps `prisma.<model>.update` with userId safety check
- `softDelete(id: string, userId: string)` — sets `deletedAt: new Date()` via `prisma.<model>.update`

Handle `PrismaClientKnownRequestError` where applicable (P2002 for unique violations, P2025 for record not found).

### 4. Migration Command

After updating the schema, run:

```bash
npx prisma migrate dev --name <descriptive-migration-name>
npx prisma generate
```

Migration name convention: `kebab-case` describing the change

- `create-accounts-table`
- `add-investment-type-to-investments`
- `add-soft-delete-to-transactions`

## Conventions Checklist

- [ ] All monetary fields are `Int` (cents), named with `*Cents` suffix, mapped to `*_cents`
- [ ] Every model has `id`, `userId`, `createdAt`, `updatedAt`, `deletedAt`
- [ ] Table name uses `@@map` with snake_case plural
- [ ] All field names use `@map` for snake_case column names
- [ ] Relations use `onDelete: Restrict` for financial data
- [ ] Enums use SCREAMING_SNAKE_CASE values
- [ ] No `Float` fields for money — only `Int` or `Decimal` for non-monetary precision
