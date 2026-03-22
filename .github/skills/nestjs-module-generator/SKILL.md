---
name: nestjs-module-generator
description: Generates a new NestJS module following MyBills conventions: creates controller, service, repository with Dependency Inversion Principle (DIP), strict TypeScript typing, and proper project structure organization.
---

# NestJS Module Generation Guide

## When to Use

- Creating a new domain module in `apps/api/src/modules`
- Ensuring consistent module architecture across the project
- Need to add common utilities shared across multiple modules

## What This Skill Does

1. **Creates module scaffolding** with controller, service, and repository
2. **Applies DIP** by using interface-based contracts and dependency injection
3. **Sets up Prisma repository pattern** with typed methods
4. **Follows naming conventions** and TypeScript strict mode
5. **Organizes reusable code** in `common/` when needed
6. **Ensures type safety** (no `any`, explicit types, no null assertions)
7. **Uses `packages/core` contracts** for shared dtos and domain entities

## Prerequisites

- Understanding of the domain entity structure
- Node.js development environment running
- `packages/core` available (or created during the workflow) to host shared contracts and domain entities

## Step-by-Step Process

### 0. **Create or Update `packages/core` First**

- Create shared dtos in `packages/core/src/dtos`
- Create domain entities in `packages/core/src/entities`
- Export everything through `packages/core/src/index.ts`
- Use these shared contracts in `apps/api` DTOs and service return types
- Example:

  ```typescript
  // packages/core/src/dtos/create-account.dto.ts
  export interface CreateAccountDto {
    name: string;
    balance: number;
    accountType: 'CHECKING' | 'SAVINGS';
  }

  // packages/core/src/entities/account.entity.ts
  export class AccountEntity {
    constructor(
      public readonly id: string,
      public readonly name: string,
      public readonly balance: number,
      public readonly accountType: 'CHECKING' | 'SAVINGS'
    ) {}
  }
  ```

### 1. **Define the Module Repository Interface Contract**

- Create `apps/api/src/modules/[module]/repositories/[module].repository.ts`
- Define a repository interface (abstraction) using `export interface [Module]Repository`
- List all public methods with explicit return types
- Example:
  ```typescript
  export interface AccountRepository {
    getAll(): Promise<Account[]>;
    getById(id: string): Promise<Account | undefined>;
    create(data: CreateAccountInput): Promise<Account>;
    update(id: string, data: UpdateAccountInput): Promise<Account>;
    delete(id: string): Promise<void>;
  }
  ```

### 2. **Create the repository implementation**

- File: `apps/api/src/modules/[module]/repositories/prisma/prisma-[module].repository.ts`
- Implements single-responsibility methods aligned with service interface
- **All Prisma queries must be here** — never in controller or service
- Example:

  ```typescript
  import { Injectable } from '@nestjs/common';
  import { PrismaService } from 'src/modules/database/prisma/prisma.service';
  import { Account, Prisma } from 'src/generated/prisma/client';

  @Injectable()
  export class PrismaAccountRepository implements AccountRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.AccountCreateInput): Promise<Account> {
      return this.prisma.account.create({ data });
    }

    async findById(id: string): Promise<Account | undefined> {
      return this.prisma.account.findUnique({ where: { id } });
    }

    async findAll(): Promise<Account[]> {
      return this.prisma.account.findMany();
    }

    async update(id: string, data: Prisma.AccountUpdateInput): Promise<Account> {
      return this.prisma.account.update({ where: { id }, data });
    }

    async delete(id: string): Promise<void> {
      await this.prisma.account.delete({ where: { id } });
    }
  }
  ```

### 3. **Create the Service (Business Logic)**

- File: `apps/api/src/modules/[module]/[module].service.ts`
- Injects repository as dependency (DIP)
- Contains all business logic and validation
- Returns domain entities from `packages/core` (not Prisma models directly)
- Example:

  ```typescript
  @Injectable()
  export class AccountService {
    constructor(private readonly repository: AccountRepository) {}

    async getAll(): Promise<Account[]> {
      return this.repository.findAll();
    }

    async getById(id: string): Promise<Account | undefined> {
      return this.repository.findById(id);
    }

    async create(data: CreateAccountInput): Promise<Account> {
      // Business logic validation here
      return this.repository.create(data);
    }

    async update(id: string, data: UpdateAccountInput): Promise<Account> {
      const account = await this.repository.findById(id);
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      return this.repository.update(id, data);
    }

    async delete(id: string): Promise<void> {
      const account = await this.repository.findById(id);
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      await this.repository.delete(id);
    }
  }
  ```

### 4. **Create the Controller**

- File: `apps/api/src/modules/[module]/[module].controller.ts`
- Injects service as dependency (abstraction)
- Maps HTTP requests to service methods
- Handles HTTP concerns only (status codes, DTOs)
- **Never contains business logic**
- Example:

  ```typescript
  import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
  import { CreateAccountInput, UpdateAccountInput } from './account.dto';

  @Controller('accounts')
  export class AccountController {
    constructor(private readonly service) {}

    @Get()
    async findAll() {
      return this.service.getAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.service.getById(id);
    }

    @Post()
    async create(@Body() input: CreateAccountInput) {
      return this.service.create(input);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() input: UpdateAccountInput) {
      return this.service.update(id, input);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
      await this.service.delete(id);
    }
  }
  ```

### 5. **Create Module Definition**

- File: `apps/api/src/modules/[module]/[module].module.ts`
- Declares controller and providers (service + repository)
- Uses token-based dependency injection for the interface
- Imports DatabaseModule if needed
- Example:

  ```typescript
  @Module({
    imports: [DatabaseModule],
    controllers: [AccountController],
    providers: [
      AccountService
      {
        provide: AccountRepository,
        useClass: PrismaAccountRepository
      }
    ],
    exports: [AccountService]
  })
  export class AccountModule {}
  ```

### 6. **Create DTO (Data Transfer Objects)** _(if needed)_

- File: `apps/api/src/modules/[module]/dto/[module].dto.ts`
- Defines request/response shapes based on `packages/core` pure interfaces
- Uses strong typing (no `any`)
- DTOs in API must implement contracts from `packages/core`
- Example:

  ```typescript
  export class CreateAccountInput {
    name!: string;
    balance!: number;
    accountType!: 'CHECKING' | 'SAVINGS';
  }

  export class UpdateAccountInput {
    name?: string;
    balance?: number;
  }
  ```

### 7. **Register Module in AppModule**

- File: `apps/api/src/app.module.ts`
- Add the new module to the `imports` array
- Example:

  ```typescript
  import { AccountModule } from './modules/account/account.module';

  @Module({
    imports: [
      ConfigModule.forRoot({
        validate: validate
      }),
      AccountModule
    ]
    // ...
  })
  export class AppModule {}
  ```

### 8. **Handle Reusable Code (if applicable)**

- If multiple modules need the same utility, exception handler, or interceptor:
- Create in `apps/api/src/common/[category]/[utility-name].ts`
- Examples:
  - `common/exceptions/` — custom exception classes
  - `common/decorators/` — validation/auth decorators
  - `common/utils/` — helper functions
  - `common/filters/` — error filters

## Decision Rule: `packages/core` vs `apps/api/src/common`

- Put in `packages/core`:
  - Pure interfaces shared with other apps
  - Domain entities returned by services
  - Domain-level value objects without NestJS dependencies
- Put in `apps/api/src/common`:
  - NestJS runtime concerns (decorators, guards, filters, interceptors)
  - API-only helpers that are not shared with other apps
  - Infrastructure-specific utilities
