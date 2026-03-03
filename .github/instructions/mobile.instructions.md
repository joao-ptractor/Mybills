---
applyTo: "apps/mobile/**"
---

# Mobile — React Native + Expo Coding Instructions

## Navigation

- Use **Expo Router** (file-based routing). All screens live under `apps/mobile/app/`.
- Route groups use parentheses: `(auth)/`, `(tabs)/`, `(modals)/`.
- Never use React Navigation's imperative API directly when Expo Router provides a declarative alternative.
- Use `router.push`, `router.replace`, and `router.back` from `expo-router`.

```
apps/mobile/app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx          # Dashboard / home
│   ├── transactions.tsx
│   ├── cards.tsx
│   └── investments.tsx
└── _layout.tsx
```

## State Management

Use **two layers** of state:

| Layer | Tool | Use for |
|-------|------|---------|
| Server state | TanStack Query (`@tanstack/react-query`) | API data: fetching, caching, mutations, background sync |
| Client/UI state | Zustand | Auth session, UI preferences, filters, modals open state |

### Zustand Rules

- One store file per domain slice: `stores/useAuthStore.ts`, `stores/useAccountsStore.ts`, etc.
- Stores expose state and actions together in the same `create` call.
- Never store derived data in Zustand — compute it with `useMemo` or selectors.
- Persist auth tokens with `zustand/middleware` `persist` + `AsyncStorage`.

```typescript
// Example: stores/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearSession: () => set({ token: null }),
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
```

### TanStack Query Rules

- All API calls go through a service module (`services/api/`), not inline in components.
- Use `useQuery` for reads, `useMutation` for writes.
- Always handle `isLoading`, `isError`, and the happy path in components.
- Invalidate related queries after mutations.

## Component Organization

```
apps/mobile/
├── app/                    # Expo Router pages (screens only)
├── components/
│   ├── ui/                 # Reusable primitives (Button, Input, Card, etc.)
│   └── features/           # Domain-specific components (TransactionItem, AccountCard)
├── hooks/                  # Custom hooks (useTransactions, useBalanceSummary)
├── services/
│   └── api/                # API service functions — all fetch calls live here
├── stores/                 # Zustand stores
└── constants/              # Colors, typography, spacing tokens
```

### Component Rules

- Screen components (files inside `app/`) must contain **no business logic**.
- Extract API calls and state management into custom hooks inside `hooks/`.
- UI components in `components/ui/` must be **stateless and generic** — no API calls, no store access.
- Feature components in `components/features/` may access stores and hooks but must not make direct API calls.

```typescript
// BAD — business logic in screen
export default function TransactionsScreen() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/api/transactions').then(...) }, []);
  ...
}

// GOOD — logic in hook
export default function TransactionsScreen() {
  const { transactions, isLoading } = useTransactions();
  ...
}
```

## API Service Layer

- All API calls are in `services/api/` — one file per domain resource.
- Use a shared Axios (or fetch) instance with the auth token injected via interceptor.
- Service functions return typed response shapes.

```typescript
// services/api/transactions.service.ts
export async function fetchTransactions(accountId: string): Promise<Transaction[]> {
  const response = await apiClient.get(`/accounts/${accountId}/transactions`);
  return response.data;
}
```

## Styling

- Use `StyleSheet.create` for all styles — never inline style objects.
- Keep styles at the bottom of each file, after the component.
- Use constants from `constants/` for colors, spacing, and font sizes — never hardcode values.
- Support both light and dark mode using `useColorScheme` from `react-native`.

## TypeScript Rules

- All props interfaces are named `<ComponentName>Props`.
- All API response types are shared in a `types/` directory or co-located with the service.
- Screen component default export must have explicit `React.FC` or an inferred return type — never untyped.

## Financial Display Rules

- **Never display raw cents to the user.** Always divide by 100 and format with a currency formatter.
- Use `Intl.NumberFormat` with `style: 'currency'` and `currency: 'BRL'`.
- Negative balances display in red; positive in the default text color.

```typescript
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}
```
