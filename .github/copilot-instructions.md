# MyBills — Copilot Instructions

## Project Overview

MyBills is a personal finance management application. It allows the user to track:
- Bank accounts and their balances
- Credit cards and monthly invoices
- Financial transactions (income, expenses, transfers)
- Investments (stocks, fixed income, crypto, etc.)
- Categories and tags for transactions

## Monorepo Structure

This project is a Turborepo monorepo using npm workspaces.

```
mybills/
├── apps/
│   ├── api/          # NestJS REST API (backend)
│   └── mobile/       # React Native + Expo (mobile client)
├── packages/
│   ├── eslint-config/        # Shared ESLint configurations
│   └── typescript-config/    # Shared TypeScript configurations
```

- **apps/api**: The sole source of truth for business logic and data persistence.
- **apps/mobile**: Consumes the API; handles only presentation and local UX state.
- **packages/**: Shared tooling — never contains application logic.

## Technology Stack

| Area | Technology |
|------|-----------|
| API Framework | NestJS 11 |
| Mobile | React Native 0.83 + Expo 55 |
| Language | TypeScript 5 (strict mode everywhere) |
| Database | PostgreSQL via Prisma ORM |
| Mobile State | Zustand |
| Build System | Turborepo |
| Linting | ESLint 9 (flat config) |
| Formatting | Prettier (100 chars, single quotes, 2-space indent) |
| Testing (API) | Jest + @nestjs/testing + Supertest |

## General Coding Conventions

- Never use `any`. Use `unknown` and narrow with type guards when the type is truly unknown.
- Never use non-null assertion (`!`) — handle nullability explicitly.
- Prefer `const` over `let`; never use `var`.
- Use named exports, not default exports, except for React Native screen components and Expo Router pages.
- All public functions and methods must have explicit return types.
- Keep functions small and focused — prefer composition over long procedures.
- Never hardcode strings that represent domain concepts (column names, status values, etc.) — use enums or const maps.
- Never commit secrets, credentials, or `.env` files.

## Financial Domain Rules

- **Monetary amounts are always stored and computed as integers (cents)**. Never use floating-point for money. `R$ 12,50` is stored as `1250`.
- **Balances can be negative** (overdraft, credit card debt).
- **No hard deletes on financial records** — use soft delete (`deletedAt`) on every financial entity.
- All timestamps are UTC. Display formatting is handled by the client.

## Commit Message Style

Use Conventional Commits:

```
<type>(<scope>): <short description>

Types: feat, fix, refactor, test, docs, chore, build
Scope: api, mobile, db, config, shared

Examples:
feat(api): add accounts module with CRUD endpoints
fix(mobile): correct balance display for negative values
chore(db): add prisma migration for transactions table
```

## What Copilot Should NOT Do

- Do not generate Prisma queries outside of `*.repository.ts` files.
- Do not add business logic to controllers or screen components.
- Do not use `parseFloat` or `toFixed` for monetary values.
- Do not suggest `class-transformer` `plainToClass` without `excludeExtraneousValues: true`.
- Do not generate migrations manually — always use `npx prisma migrate dev`.
- Do not use `console.log` in production code — use NestJS Logger or a dedicated logging service.
