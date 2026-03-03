---
agent: agent
description: Scaffold a new Expo Router screen with hook, Zustand store slice, and API service
---

# Scaffold a New Expo Router Screen

Generate a complete screen for the MyBills mobile app, following the component/hook/store/service separation.

## Input

**Screen name**: [PROVIDE THE SCREEN NAME — e.g., `AccountDetails`, `TransactionList`, `InvestmentPortfolio`]
**Route path**: [PROVIDE THE EXPO ROUTER PATH — e.g., `(tabs)/accounts`, `(tabs)/accounts/[id]`]
**Domain**: [PROVIDE THE DOMAIN — e.g., `accounts`, `transactions`, `investments`]

## Files to Generate

### 1. `app/<route-path>.tsx` — Screen Component

- Default export (required by Expo Router)
- No business logic — all logic in the custom hook
- Import and call the custom hook
- Handle `isLoading` state (show `ActivityIndicator`)
- Handle `isError` state (show error message with retry)
- Render the list/detail using feature components from `components/features/`
- Use `useRouter` for navigation actions

```typescript
export default function <ScreenName>Screen() {
  const { data, isLoading, isError } = use<ScreenName>();

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorView />;

  return (
    <SafeAreaView style={styles.container}>
      {/* screen content */}
    </SafeAreaView>
  );
}
```

### 2. `hooks/use<ScreenName>.ts` — Custom Hook

- Use TanStack Query `useQuery` for fetching data
- Use `useMutation` for any write operations with `onSuccess` query invalidation
- Use Zustand store for any client-side state
- Return: `{ data, isLoading, isError, <actions> }`

### 3. `services/api/<domain>.service.ts` (add to or create)

- Add the API functions needed by this screen
- Typed function with explicit return type
- Uses the shared `apiClient` instance

### 4. `stores/use<Domain>Store.ts` (add to or create, only if client state is needed)

- Zustand store slice for UI state (filters, selected items, modal open states)
- Do NOT store API data in Zustand — that's TanStack Query's job
- If the store already exists, only add the new state needed

## Currency Display Rules

- Always use `formatCurrency(cents)` utility for displaying money
- Negative values should use red text (`colors.error`)
- Positive values use default text color

## Conventions Reminder

- StyleSheet.create at the bottom of each component file
- Use constants from `constants/` for colors, spacing, typography — no hardcoded values
- Props interface named `<ComponentName>Props`
- All text visible to users must support accessibility (`accessibilityLabel`)
- Screen must handle both light and dark mode via `useColorScheme`
