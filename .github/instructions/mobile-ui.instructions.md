---
description: 'Use when implementing or refactoring apps/mobile screens, components, hooks, and data flows. Enforces dumb UI components, Zustand + React Query usage, and shared cross-platform logic in packages/.'
name: 'MyBills Mobile UI Instructions'
applyTo: 'apps/mobile/**/*.{ts,tsx}'
---

# MyBills Mobile UI Instructions

## Scope

- Applies to all code under `apps/mobile`.
- Focus on interface composition, state management, and integration boundaries.

## UI and Business Logic Separation (Hard Rule)

- Keep UI components dumb/presentational:
  - Receive data via props.
  - Emit user actions via callbacks.
  - No business decisions, no API orchestration, no data transformation pipelines.
- Put business logic in hooks/services/stores outside UI components.
- Screens should orchestrate data sources and pass ready-to-render props to presentational components.

## State Management

- Use `@tanstack/react-query` for server state:
  - Fetching, caching, invalidation, retries, and async status.
  - Do not duplicate server state in Zustand.
- Use `zustand` for client/app state:
  - UI preferences, local filters, wizard step state, ephemeral UX state.
  - Keep stores focused and slice-based.

## Reuse Across Mobile and React Web

- Any platform-agnostic code must live in `packages/*` instead of `apps/mobile`:
  - API client functions and request helpers.
  - Shared hooks with no React Native dependency.
  - Formatters, mappers, validators, and utility functions.
  - DTO and schema usage helpers.
- Keep shared modules framework-agnostic:
  - No `react-native` imports in reusable packages.
  - No navigation or device APIs in reusable packages.
- In `apps/mobile`, only keep platform-specific adapters and UI bindings.

## Recommended Composition Pattern

- Container/screen level:
  - Compose React Query hooks and Zustand selectors/actions.
  - Map domain data to view model props.
- Presentational component level:
  - Render-only behavior.
  - Controlled inputs and callback outputs.

## Non-Goals

- Do not embed API calls directly in UI components.
- Do not encode business rules directly in JSX.
- Do not create duplicated formatting or API logic in `apps/mobile` if it can be shared in `packages/*`.
