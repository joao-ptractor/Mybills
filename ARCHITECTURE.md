# MyBills — Architecture

## Overview

MyBills is a personal finance management application built as a Turborepo monorepo. A NestJS REST API serves as the backend, and a React Native + Expo app provides the mobile client.

## Repository Structure

```
mybills/
├── apps/
│   ├── api/        # NestJS REST API — all business logic and persistence
│   └── mobile/     # React Native + Expo — presentation and local UX state
├── packages/
│   ├── eslint-config/       # Shared ESLint flat configs
│   └── typescript-config/   # Shared tsconfig presets (base, nest)
```

## Backend Architecture — Layered (apps/api)

The API follows a strict three-layer architecture per feature module.

```
HTTP Request
     │
     ▼
┌────────────┐
│ Controller │  → Routing, input validation (DTOs), response shaping
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Service   │  → Business logic, orchestration, domain rules
└─────┬──────┘
      │
      ▼
┌──────────────┐
│  Repository  │  → Prisma queries — ONLY layer that touches the database
└─────┬────────┘
      │
      ▼
┌──────────────┐
│  PostgreSQL  │  (via Prisma ORM)
└──────────────┘
```

### Rules

- Controllers are thin: no `if` blocks for domain decisions.
- Services hold all business logic; they have no knowledge of HTTP.
- Repositories are the only layer that imports `PrismaService`.
- No layer may skip another (controllers cannot call repositories).

### Feature Module Layout

```
src/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.repository.ts
├── <feature>.controller.spec.ts
├── <feature>.service.spec.ts
└── dto/
    ├── create-<feature>.dto.ts
    ├── update-<feature>.dto.ts
    └── <feature>-response.dto.ts
```

## Mobile Architecture (apps/mobile)

```
Expo Router Screen (app/)
        │  calls
        ▼
  Custom Hook (hooks/)
   │           │
   ▼           ▼
Zustand     TanStack Query
(UI state)  (server state)
                │  calls
                ▼
        API Service (services/api/)
                │  HTTP
                ▼
           MyBills API
```

- **Screens** (`app/`): No logic. Render from hook output.
- **Hooks** (`hooks/`): Combine Zustand + TanStack Query. Single responsibility.
- **Zustand stores** (`stores/`): Client/UI state only (auth token, filters, modal state).
- **TanStack Query**: All server data — fetching, caching, mutations.
- **API services** (`services/api/`): Typed wrappers around HTTP calls.
- **UI components** (`components/ui/`): Stateless primitives.
- **Feature components** (`components/features/`): Domain-specific, may read stores.

## Domain Entities

```
User
 ├── Account          (type: CHECKING | SAVINGS | INVESTMENT | WALLET)
 │    └── Transaction (type: INCOME | EXPENSE | TRANSFER)
 ├── CreditCard
 │    ├── Invoice     (monthly statements)
 │    └── Transaction (credit card expenses)
 ├── Investment
 │    └── InvestmentEvent  (buy / sell / dividend events)
 └── Category         (tags transactions by type)
```

### Key Domain Rules

- **All monetary amounts stored as integers (cents).** `R$ 12,50` → `1250`.
- **No hard deletes on financial records.** Soft delete via `deletedAt`.
- **All IDs are UUIDs.** No integer IDs exposed to clients.
- **Balances can be negative** (overdraft, credit card debt).
- **All timestamps are UTC.** Formatting is the client's responsibility.

## Data Flow

```
[Mobile App] ──HTTPS──► [NestJS API] ──► [PostgreSQL]
                              │
                         JWT Auth
                         Validation
                         Business Rules
                         Prisma ORM
```

## Authentication

> Strategy: JWT (to be implemented)

- Login/register endpoints are public.
- All other endpoints require a valid JWT bearer token.
- Token contains `userId` — extracted via `@CurrentUser()` decorator.
- Refresh token strategy: TBD.

## Technology Stack

|              | Technology               | Version      |
| ------------ | ------------------------ | ------------ |
| Monorepo     | Turborepo                | 2.x          |
| API          | NestJS                   | 11.x         |
| Mobile       | React Native + Expo      | 0.83 + 55    |
| Language     | TypeScript               | 5.x (strict) |
| Database     | PostgreSQL               | latest       |
| ORM          | Prisma                   | latest       |
| Mobile State | Zustand + TanStack Query | latest       |
| Testing      | Jest + Supertest         | latest       |
| Linting      | ESLint 9 (flat config)   | 9.x          |
| Formatting   | Prettier                 | 3.x          |

## Development Commands

```bash
# Run all apps in development mode
npm run dev

# Build all apps
npm run build

# Lint all packages
npm run lint

# Type-check all packages
npm run check-types

# Format all files
npm run format

# Database migrations (from apps/api/)
npx prisma migrate dev --name <description>
npx prisma generate
npx prisma studio
```
