---
applyTo: 'apps/api/**'
---

# API — NestJS Coding Instructions

## Architecture: Layered (Controller → Service → Repository)

The API follows a strict three-layer architecture. Each layer has a single responsibility:

| Layer      | File suffix       | Responsibility                                                  |
| ---------- | ----------------- | --------------------------------------------------------------- |
| Controller | `*.controller.ts` | HTTP routing, request validation, response shaping              |
| Service    | `*.service.ts`    | Business logic, orchestration between repositories              |
| Repository | `*.repository.ts` | All Prisma interactions — only layer that imports PrismaService |

### Rules

1. **Controllers are thin.** They must only: extract DTO from request, call the service, and return the result. No `if` blocks for business decisions.
2. **Services own business logic.** Validation rules, calculations, and domain decisions live here.
3. **Repositories are the only Prisma consumers.** Never import or use `PrismaService` outside a `*.repository.ts` file.
4. **Never skip a layer.** Controllers must not call repositories directly.

## Module Structure

Every feature is a self-contained NestJS module:

```
apps/api/src/
└── <feature>/
    ├── <feature>.module.ts
    ├── <feature>.controller.ts
    ├── <feature>.service.ts
    ├── <feature>.repository.ts
    ├── <feature>.controller.spec.ts
    ├── <feature>.service.spec.ts
    ├── dto/
    │   ├── create-<feature>.dto.ts
    │   ├── update-<feature>.dto.ts
    │   └── <feature>-response.dto.ts
    └── entities/      # (optional) domain interfaces/types
        └── <feature>.entity.ts
```

Examples of feature modules: `accounts`, `cards`, `transactions`, `invoices`, `investments`, `categories`.

## Controllers

- Decorate every controller with `@ApiTags('<feature>')`.
- Decorate every endpoint with `@ApiOperation`, `@ApiResponse`.
- Use `@UseGuards(JwtAuthGuard)` on all protected endpoints.
- Use `ParseIntPipe`, `ParseUUIDPipe` for path parameter validation.
- Return HTTP 201 for creation, 200 for reads/updates, 204 for deletes.

```typescript
@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, type: AccountResponseDto })
  create(@Body() dto: CreateAccountDto): Promise<AccountResponseDto> {
    return this.accountsService.create(dto);
  }
}
```

## Services

- Services receive and return typed objects (DTOs or domain entity interfaces).
- Services must never throw HTTP exceptions (`HttpException`, `BadRequestException`, etc.) — those belong in controllers... **EXCEPTION**: NestJS exceptions are acceptable in services when the error is domain-meaningful (e.g., `NotFoundException` when a resource doesn't exist).
- Inject repositories via constructor dependency injection.

## Repositories

- Inject `PrismaService` via constructor.
- Methods must be named semantically: `findById`, `findAllByUserId`, `create`, `update`, `softDelete`.
- Always pass the `userId` filter to prevent cross-user data leaks.
- Return Prisma model types internally; the service maps them to DTOs.

```typescript
@Injectable()
export class AccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, userId: string) {
    return this.prisma.account.findFirst({
      where: { id, userId, deletedAt: null }
    });
  }
}
```

## Error Handling

Use NestJS built-in exceptions:

| Situation            | Exception               |
| -------------------- | ----------------------- |
| Resource not found   | `NotFoundException`     |
| Invalid input        | `BadRequestException`   |
| Not authorized       | `ForbiddenException`    |
| Unauthenticated      | `UnauthorizedException` |
| Conflict (duplicate) | `ConflictException`     |

## Global Rules

- Use `@nestjs/config` with `ConfigService` — never use `process.env` directly in application code.
- Use NestJS `Logger` class for logging — never `console.log`.
- All endpoints require authentication unless explicitly marked `@Public()`.
- UUIDs for all entity IDs — never auto-increment integers exposed to clients.
