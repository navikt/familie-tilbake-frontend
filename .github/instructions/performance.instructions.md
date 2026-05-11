---
applyTo: "src/**/*.{tsx,ts}"
---

# Performance Optimization

Core Web Vitals targets and performance patterns for React SPA med Vite, TanStack Query og Aksel Design System på NAIS.

## Core Web Vitals Targets

All user-facing pages must meet "Good" thresholds:

| Metric | Good | Needs Improvement | Poor |
| --- | --- | --- | --- |
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s – 4.0s | > 4.0s |
| INP (Interaction to Next Paint) | < 200ms | 200ms – 500ms | > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 – 0.25 | > 0.25 |
| TTFB (Time to First Byte) | < 800ms | 800ms – 1800ms | > 1800ms |

## Data Fetching (TanStack Query)

### Parallel data fetching

```tsx
import { useQueries } from "@tanstack/react-query";

// ✅ Good — parallel fetching with useQueries
function Dashboard() {
  const [users, metrics, config] = useQueries({
    queries: [
      { queryKey: ["users"], queryFn: fetchUsers },
      { queryKey: ["metrics"], queryFn: fetchMetrics },
      { queryKey: ["config"], queryFn: fetchConfig },
    ],
  });

  return <DashboardView users={users.data} metrics={metrics.data} config={config.data} />;
}

// ❌ Bad — sequential dependent queries when data is independent
function Dashboard() {
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
  const { data: metrics } = useQuery({ queryKey: ["metrics"], queryFn: fetchMetrics, enabled: !!users });
  // metrics venter unødvendig på users
}
```

### Stale time og caching

```tsx
// ✅ Good — konfigurer stale time basert på datahyppighet
const { data } = useQuery({
  queryKey: ["behandling", behandlingId],
  queryFn: () => hentBehandling(behandlingId),
  staleTime: 5 * 60 * 1000, // 5 minutter
});

// ✅ Good — prefetch data brukeren sannsynligvis trenger
const queryClient = useQueryClient();
function BehandlingsListe({ behandlinger }: Props) {
  return behandlinger.map((b) => (
    <Link
      key={b.id}
      to={`/behandling/${b.id}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ["behandling", b.id],
          queryFn: () => hentBehandling(b.id),
        });
      }}
    >
      {b.navn}
    </Link>
  ));
}
```

### Suspense for data loading

```tsx
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Skeleton } from "@navikt/ds-react";

function Page() {
  return (
    <VStack gap="8">
      <Heading size="large" level="1">Oversikt</Heading>
      <QuickSummary />
      <Suspense fallback={<Skeleton variant="rounded" height={300} />}>
        <SlowAnalytics />
      </Suspense>
    </VStack>
  );
}

function SlowAnalytics() {
  const { data } = useSuspenseQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });
  return <AnalyticsChart data={data} />;
}
```

## Image Optimization

```tsx
// ✅ Good — eksplisitte dimensjoner forhindrer CLS, loading="eager" for LCP-bilder
<img
  src="/hero-banner.png"
  alt="Oversikt over tjenester"
  width={1200}
  height={630}
  loading="eager"
  fetchPriority="high"
/>

// ✅ Good — under the fold, lazy loaded
<img
  src="/chart.png"
  alt="Bruksstatistikk"
  width={800}
  height={400}
  loading="lazy"
/>

// ❌ Bad — ingen dimensjoner, forårsaker CLS
<img src="/hero-banner.png" />
```

Regler:
- Sett `loading="eager"` og `fetchPriority="high"` på above-the-fold bilder (LCP-kandidater)
- Oppgi alltid `width` og `height` for å forhindre layout shift
- Bruk `loading="lazy"` for bilder under the fold
- Bruk moderne formater (WebP/AVIF) der mulig

## Font Optimization

```html
<!-- index.html — preload fonter for å unngå FOIT/FOUT -->
<link rel="preload" href="/fonts/Source-Sans-3-Regular.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/Source-Sans-3-SemiBold.woff2" as="font" type="font/woff2" crossorigin />
```

```css
/* font-display: swap forhindrer usynlig tekst under lasting */
@font-face {
  font-family: "Source Sans 3";
  src: url("/fonts/Source-Sans-3-Regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}
```

## Bundle Optimization

### Lazy loading med React.lazy

```tsx
import { lazy, Suspense } from "react";
import { Skeleton } from "@navikt/ds-react";

// ✅ Good — tung komponent lastes kun når den trengs
const HeavyChart = lazy(() => import("./components/heavy-chart"));

function ChartSection() {
  return (
    <Suspense fallback={<Skeleton variant="rounded" height={400} />}>
      <HeavyChart />
    </Suspense>
  );
}
```

### Route-basert code splitting

```tsx
// ✅ Good — lazy loading av ruter (allerede brukt via lazyImportMedRetry)
const BehandlingContainer = lazy(() => import("./pages/BehandlingContainer"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
```

### Tree-shaking: named imports

```tsx
// ✅ Good — tree-shakeable named import
import { Button, Heading } from "@navikt/ds-react";

// ❌ Bad — importerer hele pakken, ødelegger tree-shaking
import * as Aksel from "@navikt/ds-react";
```

### Barrel file anti-pattern

```tsx
// ❌ Bad — barrel export drar inn alle komponenter
// components/index.ts
export { Header } from "./header";
export { Footer } from "./footer";
export { Sidebar } from "./sidebar";
export { HeavyChart } from "./heavy-chart"; // Alltid bundlet selv om ubrukt

// ✅ Good — importer direkte fra komponentfilen
import { Header } from "./components/header";
```

### Analyser bundelen

```bash
# Bruk rollup-plugin-visualizer (allerede integrert i Vite)
npx vite-bundle-visualizer
```

## Aksel-Specific Performance

```tsx
// ✅ Good — individuelle komponent-importer (tree-shakeable)
import { Button } from "@navikt/ds-react";
import { Heading } from "@navikt/ds-react";

// ❌ Bad — wildcard import laster hele biblioteket
import * as Aksel from "@navikt/ds-react";

// ✅ Good — spesifikk ikon-import
import { ChevronRightIcon } from "@navikt/aksel-icons";

// ❌ Bad — barrel import av alle ikoner
import * as Icons from "@navikt/aksel-icons";
```

CSS tokens fra `@navikt/ds-css` lastes én gang globalt — ingen ekstra ytelsesproblem.

## Anti-Patterns

Vanlige ytelsesfeil å unngå:

1. **Sekvensielle queries** når forespørsler er uavhengige — bruk `useQueries()` eller `Promise.all()`
2. **Manglende `key` prop** på listeelementer — forårsaker unødvendige re-renders og DOM-thrashing
3. **State i forelder** når den hører hjemme i barn — trigger render-kaskader i hele subtreet
4. **Manglende `React.memo` / `useMemo`** for dyre beregninger eller stabile referanser
5. **Bilder uten dimensjoner** — ingen eksplisitt `width` og `height`
6. **Synkron `import()`** av store biblioteker — bruk `React.lazy()` med Suspense
7. **Layout shifts fra dynamisk innhold** uten skeleton eller placeholder
8. **Over-fetching** — hente hele objekter når kun noen felt trengs (`select` i useQuery)
9. **Manglende staleTime** — unødvendige refetch ved mount
10. **Store Zustand stores** — splitt i fokuserte stores med selectors

## Measurement

### Grafana Faro

```tsx
// Allerede konfigurert i prosjektet via Grafana Faro
// Sender automatisk Core Web Vitals til Grafana
```

### web-vitals bibliotek

```tsx
import { onLCP, onINP, onCLS } from "web-vitals";

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

### Tools

- **Grafana Faro** for Real User Monitoring (RUM) — allerede integrert
- **Lighthouse CI** i GitHub Actions for automatiserte ytelsesbudsjetter
- **Chrome DevTools Performance tab** for profilering av renders og long tasks
- **React DevTools Profiler** for å identifisere unødvendige re-renders

## Caching (TanStack Query)

### Query caching-strategi

```tsx
// Global default — 5 min stale time
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

// ✅ Good — optimistisk oppdatering for bedre UX
const mutation = useMutation({
  mutationFn: oppdaterBehandling,
  onMutate: async (nyData) => {
    await queryClient.cancelQueries({ queryKey: ["behandling", id] });
    const forrige = queryClient.getQueryData(["behandling", id]);
    queryClient.setQueryData(["behandling", id], nyData);
    return { forrige };
  },
  onError: (_err, _ny, context) => {
    queryClient.setQueryData(["behandling", id], context?.forrige);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["behandling", id] });
  },
});
```

### Select for å redusere re-renders

```tsx
// ✅ Good — kun re-render ved endring i valgt data
const { data: antall } = useQuery({
  queryKey: ["behandlinger"],
  queryFn: hentBehandlinger,
  select: (data) => data.length,
});
```

## Boundaries

### ✅ Always

- Meet Core Web Vitals "Good" thresholds
- Bruk `React.lazy()` for route-basert code splitting
- Sett eksplisitte dimensjoner på bilder
- Mål ytelse med Grafana Faro eller Lighthouse
- Konfigurer `staleTime` på TanStack Query

### ⚠️ Ask First

- Nye globale Zustand stores
- Custom caching-strategier utover TanStack Query defaults
- Store tredjepartsbiblioteker (sjekk bundlestørrelse først)

### 🚫 Never

- Barrel exports som drar inn hele pakker
- Sekvensiell `await` / `enabled`-chaining for uavhengige data-fetches
- Bilder uten eksplisitt `width` og `height`
- `import *` fra `@navikt/ds-react` eller `@navikt/aksel-icons`

## Related

| Resource | Use For |
|----------|---------|
| `@aksel-agent` | Aksel Design System component patterns and spacing tokens |
| `playwright-testing` skill | E2E testing to validate performance optimizations |
