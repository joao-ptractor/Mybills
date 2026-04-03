---
description: 'Use when implementing or refactoring apps/api NestJS modules, controllers, services, repositories and API tests. Enforces MyBills API architecture, domain error handling, and repository conventions.'
name: 'MyBills API Instructions'
applyTo: 'apps/api/**/*.ts'
---

# MyBills API Instructions

## Module and Layering Rules

- Keep controllers thin: map HTTP input/output only.
- Put business rules in services.
- Keep persistence logic in repositories (Prisma queries stay in repository classes).
- Prefer module-local contracts in `contracts/` for input/output and dependency boundaries.
- Keep reusable framework utilities in `apps/api/src/common`.

## Dependency Injection and Boundaries

- Use NestJS DI consistently; avoid instantiating dependencies directly.
- Preserve existing module boundaries under `apps/api/src/modules/*`.
- Do not move business logic into decorators, guards, filters, or interceptors.

## Domain Error Handling

- Throw project domain errors from `apps/api/src/common/errors` for expected business failures.
- Use `InvalidArgumentError` for invalid input data.
- Use `AlreadyExistsError` for unique/conflict conditions.
- Use `NotFoundError` for missing entities or invalid credentials patterns already used by the module.
- Use `UnauthorizedError` for invalid authentication/refresh token flows.
- Do not replace domain errors with generic `Error`. When a mapped domain error exists, use it, and if not, create a new one.

## Repository Pattern Rules

- Repository interfaces live in `modules/*/repositories/*.repository.ts`.
- Prisma implementation files stay under `modules/*/repositories/prisma`.
- Service layer depends on repository abstraction, not Prisma client directly.
- Keep entity mapping explicit in repository implementation methods.
- For nullable persistence fields, reflect nullability explicitly in interface and service signatures.

## Validation and Serialization

- Use Zod schemas from `@mybills/dtos` for API inputs and outputs.
- Use `ZodValidationPipe` for request validation.
- Use `@Serialize(schema)` for response serialization.

## Prisma and Imports

- In API runtime and tests, import Prisma client from `src/generated/prisma/client`.
- Do not switch API code imports to `@prisma/client` directly.

## Testing

- After implementing or refactoring API code, update or add Jest unit and e2e tests under `apps/api/src/modules/*/test/` and `apps/api/test/e2e/` to cover new or changed behavior.
- Follow tests.instructions.md for test structure, naming, and dependency inversion rules in API tests.
