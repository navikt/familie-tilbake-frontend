---
applyTo: "**/*.test.{ts,tsx}"
---

# TypeScript Testing (Vitest)

TypeScript-spesifikke testmønstre for Nav: Vitest, mocking, async og React-komponenttesting.

## Alltid vurder
- Unngå mocking så langt det lar seg gjøre. La det være mulig å sende ned ekte data og funksjoner for mer realistiske tester.
- Lag variabler og funksjoner i testene for å unngå duplisering og gjøre det enklere å endre testdata.
- bruk rolle i stedet for å lete etter tekst når du tester interaksjoner på knapper, lenker og andre elementer som kan ha varierende tekst. For underelementer, bruk within og getByRole på det spesifikke elementet.
- Unngå waitFor så langt det lar seg gjøre. 

## Test Structure

```typescript
import { formatNumber } from "./format";

describe("formatNumber", () => {
  test("burde formatere tall med norsk locale", () => {
    expect(formatNumber(151354)).toBe("151 354");
  });

  test("burde håndtere desimaltall", () => {
    expect(formatNumber(1234.56)).toBe("1 234,56");
  });

  test("burde håndtere negative tall", () => {
    expect(formatNumber(-1000)).toBe("-1 000");
  });
});
```

## Testing Async Functions

```typescript
describe("fetchData", () => {
  test("burde hente data", async () => {
    const result = await fetchData("test-id");

    expect(result).toBeDefined();
    expect(result.id).toBe("test-id");
  });

  test("burde håndtere feil", async () => {
    await expect(fetchData("invalid")).rejects.toThrow("Not found");
  });
});
```

## Mocking

```typescript
import { vi } from "vitest";

// Mock external module
vi.mock("./cached-bigquery", () => ({
  getCachedBigQueryUsage: vi.fn(),
}));

import { getCachedBigQueryUsage } from "./cached-bigquery";

describe("API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("burde returnere data", async () => {
    vi.mocked(getCachedBigQueryUsage).mockResolvedValue({
      usage: [{ date: "2025-01-01", total_active_users: 100 }],
      error: null,
    });

    const response = await GET();
    const data = await response.json();

    expect(data.usage).toHaveLength(1);
  });
});
```

## Testing React Components

```typescript
import { render, screen } from "@testing-library/react";
import { MetricCard } from "./metric-card";

describe("MetricCard", () => {
  test("Skal vise tittel og verdi", () => {
    render(<MetricCard title="Total Users" value={100} icon={UserIcon} />);

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });
});
```

## Run Tests

```bash
pnpm test
pnpm test --coverage
```
