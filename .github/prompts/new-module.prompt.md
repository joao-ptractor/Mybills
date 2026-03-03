---
agent: agent
description: Scaffold a complete NestJS feature module following the MyBills layered architecture
---

# Scaffold a New NestJS Feature Module

Generate a complete feature module for the MyBills API following the layered architecture (Controller → Service → Repository).

## Input

**Module name**: [PROVIDE THE MODULE NAME — e.g., `accounts`, `transactions`, `investments`]

## Files to Generate

Generate the following files under `apps/api/src/<module-name>/`:

### 1. `<module>.module.ts`

- Import and provide: Controller, Service, Repository
- Import PrismaModule if not globally provided
- Export the Service if it will be used by other modules

### 2. `<module>.controller.ts`

- Decorate with `@ApiTags('<module-name>')`
- Decorate with `@UseGuards(JwtAuthGuard)`
- Implement: `POST /` (create), `GET /` (findAll), `GET /:id` (findOne), `PATCH /:id` (update), `DELETE /:id` (remove — soft delete)
- Use `@ApiOperation` and `@ApiResponse` on every endpoint
- Return types from Response DTOs
- Extract `userId` from `@CurrentUser()` decorator

### 3. `<module>.service.ts`

- Inject `<Module>Repository` via constructor
- Methods: `create`, `findAll`, `findOne`, `update`, `remove`
- `findOne` throws `NotFoundException` if record not found or doesn't belong to the user
- `remove` calls `softDelete` on the repository

### 4. `<module>.repository.ts`

- Inject `PrismaService` via constructor
- Methods: `create`, `findAllByUserId`, `findById`, `update`, `softDelete`
- All queries filter by `userId` AND `deletedAt: null`
- `softDelete` sets `deletedAt: new Date()`

### 5. `dto/create-<module>.dto.ts`

- Fields based on the domain entity
- `class-validator` decorators for all fields
- `@ApiProperty` on all fields with examples

### 6. `dto/update-<module>.dto.ts`

- Extend `CreateDto` using `PartialType` from `@nestjs/swagger`

### 7. `dto/<module>-response.dto.ts`

- Shape returned to clients
- `@Expose()` on all fields
- `@ApiProperty` on all fields
- Exclude internal fields (e.g., raw Prisma types)

### 8. `<module>.service.spec.ts`

- Unit test for the service
- Mock the repository with `jest.fn()`
- Test: create (success), findOne (success), findOne (not found → NotFoundException), remove (success)

### 9. `<module>.controller.spec.ts`

- Unit test for the controller
- Mock the service with `jest.fn()`
- Test: each endpoint delegates to the correct service method

## Conventions Reminder

- Amounts in **cents** (integer). Never floats.
- Soft delete only — set `deletedAt`, never `prisma.<model>.delete()`.
- No Prisma calls outside `*.repository.ts`.
- No business logic in controllers.
- All IDs are UUIDs — use `@IsUUID()` validator and `ParseUUIDPipe` in controllers.
