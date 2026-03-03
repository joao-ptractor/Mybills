---
applyTo: '**/*.spec.ts, **/*.test.ts, apps/api/test/**'
---

# Testing Conventions

## Test Types and Location

| Type              | Tool                     | Location                           | Scope                                  |
| ----------------- | ------------------------ | ---------------------------------- | -------------------------------------- |
| Unit (service)    | Jest + `@nestjs/testing` | Co-located: `*.service.spec.ts`    | Service logic with mocked repository   |
| Unit (controller) | Jest + `@nestjs/testing` | Co-located: `*.controller.spec.ts` | Controller routing with mocked service |
| Integration       | Jest + Supertest         | `apps/api/test/*.e2e-spec.ts`      | Full HTTP stack with test DB           |

- Unit test files live next to the source file they test.
- e2e tests live in `apps/api/test/`.
- Never run e2e tests in CI without a dedicated test database.

## Test Structure: Arrange–Act–Assert

Every test must follow the AAA pattern with blank lines separating sections:

```typescript
it('should return account by id', async () => {
  // Arrange
  const accountId = 'uuid-123';
  const expected = { id: accountId, name: 'Nubank', balanceCents: 50000 };
  mockRepository.findById.mockResolvedValue(expected);

  // Act
  const result = await service.findById(accountId, 'user-id');

  // Assert
  expect(result).toEqual(expected);
});
```

## Unit Tests — Services

- Mock the repository layer using Jest's `jest.fn()`.
- Use `createMock` from `@golevelup/ts-jest` or manual mock factories.
- Provide the mock via `{ provide: AccountsRepository, useValue: mockRepository }` in the test module.
- Test every branch of business logic (happy path + all error cases).
- Assert on thrown exceptions using `await expect(...).rejects.toThrow(NotFoundException)`.

```typescript
describe('AccountsService', () => {
  let service: AccountsService;
  let mockRepository: jest.Mocked<AccountsRepository>;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn()
      // ...
    } as any;

    const module = await Test.createTestingModule({
      providers: [AccountsService, { provide: AccountsRepository, useValue: mockRepository }]
    }).compile();

    service = module.get(AccountsService);
  });

  it('should throw NotFoundException when account does not exist', async () => {
    // Arrange
    mockRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.findById('bad-id', 'user-id')).rejects.toThrow(NotFoundException);
  });
});
```

## Unit Tests — Controllers

- Mock the service layer.
- Do not test DTOs in controller tests — test input routing and service delegation.
- Assert HTTP status codes and response shape.

## e2e Tests

- Use `supertest` with the NestJS `app.getHttpServer()`.
- Seed required data in `beforeAll` and clean up in `afterAll`.
- Use a dedicated test database (different from dev DB) — never the development database.
- Test full request-response flow including authentication headers.

```typescript
describe('AccountsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /accounts should create an account', async () => {
    // Arrange
    const dto = { name: 'Test Account', initialBalance: 1000 };

    // Act
    const response = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${testToken}`)
      .send(dto);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: 'Test Account' });
  });
});
```

## Naming Conventions

- Describe blocks: `describe('<ClassName>', () => { describe('<methodName>', () => { ... }) })`
- Test descriptions: plain English, start with `should`: `it('should throw when account not found')`
- No abbreviations in test descriptions.

## What NOT to Do

- Never use `any` to satisfy mock types — use proper typing or `as jest.Mocked<T>`.
- Never assert on `toBeTruthy` / `toBeFalsy` for domain values — be explicit (`toBe(true)`, `toEqual(...)`)
- Never test implementation details (internal method calls) — test behavior and outputs.
- Never hardcode IDs or amounts in assertions without a named constant explaining the value.
- Never skip error-path tests — every `NotFoundException`/`BadRequestException` branch must have a test.
