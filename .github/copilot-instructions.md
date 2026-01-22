---
applyTo: '**'
description: > GitHub Copilot-instruksjoner for prosjektkontekst og koderetningslinjer.
---
Gi prosjektkontekst og koderetningslinjer som AI skal følge når den genererer kode, svarer på spørsmål eller gjennomgår endringer.

Ikke alltid vær enig - vær kritisk og foreslå forbedringer når det trengs. Still oppklarende spørsmål hvis forespørselen er tvetydig.

## Prosjektoversikt
**familie-tilbake-frontend** er en saksbehandlerapplikasjon for tilbakekreving etter folketrygdloven § 22-15. 

Applikasjonen er en generisk løsning som i første omgang skal fungere for P4-ytelsene:
- Barnetrygd
- Kontantstøtte  
- Støtte til enslig forsørger
- Tilleggsstønader
- Arbeidsavklaringspenger (AAP)

Arkitekturen er designet for å være generell og skalerbar til andre ytelser i fremtiden.

## Tech Stack

### Frontend
- **Rammeverk**: React 19
- **Språk**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Routing**: React Router 7
- **State Management**: 
  - Zustand (globale stores) - *migrerer bort fra Constate*
  - React Context (useContext) for komponent-scopet state
  - TanStack Query for server state
- **Data Fetching**: 
  - TanStack Query (React Query) - useQuery, useMutation
  - Zod for runtime-validering
- **Styling**: 
  - Tailwind CSS (primær styling-løsning)
  - Styled Components - *migrerer bort (maintenance mode)*
  - NAV Design System (@navikt/ds-*)
- **Skjemaer**: React Hook Form med Zod-validering
- **HTTP Client**: Axios
- **API-generering**: @hey-api/openapi-ts (genererer TypeScript-typer, React Query hooks og Zod-schemas fra OpenAPI-spec)

### Backend (Node.js BFF - Backend for Frontend)
- **Runtime**: Node.js 20 (Distroless container)
- **Rammeverk**: Express
- **Språk**: TypeScript (kompileres med ts-node)
- **Sesjonshåndtering**: express-session med Redis (connect-redis)
- **Proxy**: http-proxy-middleware (proxyer til backend API)
- **Autentisering**: Texas (NAVs auth-klient)
- **Sikkerhet**: CSRF-beskyttelse middleware

### DevOps & Infrastruktur
- **Container**: Distroless Node.js 20 (Debian 12)
- **Pakkebehandler**: pnpm
- **Deployment**: NAVs interne plattform (GCP)
- **Build**: Separate client (Vite) og server (tsc) builds

### Monitorering & Observability
- **Error Tracking**: Sentry
- **Metrics**: Prometheus (prom-client)
- **Logging**: Winston
- **Frontend Monitoring**: Grafana Faro

### Testing
- **Test Framework**: Jest
- **Test Environment**: jsdom
- **Testing Library**: React Testing Library

### Kodekvalitet
- **Linting**: ESLint med TypeScript ESLint
- **Formatering**: Prettier
- **Git Hooks**: Husky med lint-staged
- **Tilgjengelighet**: @axe-core/react (kun i development)

### Avhengighetshåndtering
⚠️ **Aktiv vedlikehold**: Avhengigheter oppdateres nesten daglig. Sjekk `package.json` for gjeldende versjoner.

## Arkitektur

### Applikasjonsstruktur
```
src/
├── backend/          # Node.js BFF
│   ├── auth/         # Autentisering & sesjonshåndtering
│   ├── backend.ts    # Express app oppsett
│   ├── proxy.ts      # API proxy-konfigurasjon
│   ├── router.ts     # Route handlers
│   └── server.ts     # Server entry point
│
└── frontend/         # React SPA
    ├── api/          # API-klient & HTTP-konfigurasjon
    ├── components/   # React-komponenter
    ├── context/      # React Context providers (auth, theme, etc.)
    ├── generated/    # Auto-generert fra OpenAPI-spec
    ├── hooks/        # Custom React hooks
    ├── kodeverk/     # Kodetabeller/enums
    ├── pages/        # Route-sider
    ├── stores/       # Zustand stores (fagsakStore, behandlingStore)
    ├── typer/        # TypeScript-typer
    └── utils/        # Utility-funksjoner
```

### Frontend-arkitektur

#### Routing
- Bruker **React Router 7** med `createBrowserRouter`
- Lazy loading med code splitting via `lazyImportMedRetry`
- Hovedruter: Dashboard, FagsakContainer (saksvisning), 404-side

#### State Management-strategi
**Flerlags tilnærming med tydelig separasjon:**

1. **Client State** (Zustand stores)
   - Global applikasjonstilstand
   - Eksempler: `fagsakStore`, `behandlingStore`
   - Type-safe med TypeScript
   - Enkel, performant, ingen provider hell

2. **Komponent-scopet State** (React useContext)
   - State delt innenfor komponentsubtrær
   - Eksempler: `AppContext`, `ThemeContext`, `FagsakContext`, `BehandlingContext`, `TogglesContext`
   - *Merk: Migrerer bort fra Constate til native useContext*

3. **Server State** (TanStack Query)
   - All API-data fetching og mutations
   - `useQuery` for lesing (med 5 min stale time)
   - `useMutation` for skriving
   - Automatisk caching, invalidering, refetching
   - Optimistiske oppdateringer for bedre UX

4. **Skjema State** (React Hook Form + Zod)
   - Skjema-spesifikk state management
   - Runtime-validering med Zod-schemas
   - Genererte schemas fra OpenAPI-typer

#### Komponenthierarki
```
App (QueryClientProvider, ErrorBoundary)
└── Container (autentiseringssjekk)
    └── TogglesProvider
        └── FagsakProvider
            └── BehandlingProvider
                └── AppRoutes (RouterProvider)
```

#### Styling-strategi
**Migrering pågår:**
- **Mål**: Full migrering til Tailwind CSS
- **Grunn**: Styled Components er i maintenance mode
- **Nåværende tilstand**: Hybrid løsning under migrering
- **NAV Design System**: Integreres via `@navikt/ds-tailwind`

#### API-lag
- **Type-safe API-klient** generert fra OpenAPI-spec via `@hey-api/openapi-ts`
- **React Query hooks** auto-generert for alle endepunkter
- **Zod-schemas** for runtime-validering
- **Axios** som HTTP-klient med interceptors i `configureHeyApi`
- Konfigurasjon i `openapi-ts.config.ts`:
  ```typescript
  plugins: [
    '@hey-api/typescript',      // Generer TS-typer
    '@tanstack/react-query',    // Generer useQuery/useMutation hooks
    'zod',                      // Generer Zod-schemas
    '@hey-api/client-axios'     // Axios klient-konfig
  ]
  ```

### Backend-arkitektur (BFF-mønster)

#### Request Flow
```
Klient Request
    ↓
Express Server (port 8000)
    ↓
Session Middleware (Redis)
    ↓
CSRF-beskyttelse
    ↓
Autentiseringssjekk (Texas)
    ↓
Token-påhefting (access token)
    ↓
Proxy til Backend API (/familie-tilbake/api)
    ↓
Backend Response
```

#### Nøkkelfunksjoner
- **Sesjonsbasert autentisering** med Redis backing
- **Token management**: Henter og fester access tokens til backend-requests
- **Proxy-konfigurasjon**: Router `/familie-tilbake/api` til backend-service
- **Statisk asset serving**: Gzippede produksjonsassets fra `/dist`
- **Metrics endpoint**: Prometheus metrics på `/internal/metrics`

### Sikkerhet
- **CSRF-beskyttelse** på alle state-changing requests
- **Sikre session cookies** (httpOnly, signert)
- **Token-basert backend auth** via Texas
- **Ingen credentials i frontend** (BFF-mønster)
- **Content Security Policy** via helmet/NAV defaults

### Nøkkel Design Patterns
- **BFF (Backend for Frontend)**: Node.js proxy håndterer auth & tokens
- **Kodegenerering**: OpenAPI → TypeScript-typer & React Query hooks & Zod-schemas
- **Lazy loading**: Route-basert code splitting med retry-logikk
- **Error boundaries**: Grasiøs feilhåndtering på flere nivåer
- **Optimistiske oppdateringer**: React Query mutation patterns
- **Tilgjengelighet først**: NAV Design System, axe-core validering
- **Type safety overalt**: TypeScript + Zod for compile-time og runtime-validering

### Dataflyt-mønster
```
Brukerhandling
    ↓
Komponent kaller useMutation hook (generert fra OpenAPI)
    ↓
Zod-validering av request payload
    ↓
Axios request til BFF
    ↓
BFF fester auth token & proxyer til backend
    ↓
Backend respons
    ↓
Zod-validering av respons
    ↓
React Query oppdaterer cache
    ↓
Zustand store oppdateres (om nødvendig)
    ↓
Komponent re-renderer
```

### Build-prosess

#### Development
1. Start Docker (Redis): `docker-compose up`
2. Build server: `tsc`
3. Start dev-server: `NODE_ENV=development node node_dist/backend/server.js`
4. Vite dev server proxyer til Express backend

#### Production
1. **Server build**: `tsc` → `node_dist/`
2. **Client build**: `vite build` → `dist/`
3. **Docker image**: Distroless Node.js 20 med begge builds
4. **Sentry source maps**: Lastes opp under build via Vite plugin

### Miljøkonfigurasjon
- **Local**: Mock backend eller proxy til preprod
- **Dev**: GCP dev-cluster, preprod backend
- **Prod**: GCP prod-cluster, prod backend
- Miljøvariabler lastes via `hent-og-lagre-miljøvariabler.sh` (krever gcloud auth)

### Relaterte tjenester
- **Backend API**: [familie-tilbake](https://github.com/navikt/familie-tilbake)
- **Typespec-generering**: [tilbakekreving-kontrakter](https://github.com/navikt/tilbakekreving-kontrakter)
- **Auth**: Texas (NAVs interne auth-tjeneste)

## Pågående migreringer

### 1. State Management: Constate → React useContext
**Status**: Pågår  
**Grunn**: Forenkle state management, redusere avhengigheter  
**Berørte filer**: Alle context providers i `src/frontend/context/`

### 2. Styling: Styled Components → Tailwind CSS
**Status**: Pågår  
**Grunn**: Styled Components er i maintenance mode  
**Strategi**: Gradvis migrering, komponent for komponent  
**Mål**: Full Tailwind CSS med NAV Design System integrasjon

## Koderetningslinjer
Denne kodebasen er på norsk. Følg disse retningslinjene:
- Bruk norsk for variabelnavn, funksjonsnavn, kommentarer og dokumentasjon.
- Bruk engelsk for bibliotekimporter, rammeverk-spesifikke termer og teknisk sjargong.

### TypeScript
- Bruk alltid eksplisitte typer, unngå `any`
- Bruk streng TypeScript-konfigurasjon
- Foretrekk typeinferens der det er mulig
- Bruk TypeSpec-genererte typer for API-interaksjoner

### Tilstandshåndtering (Zustand)
- Zustand brukes sjelden for lokal komponenttilstand, kun for global/delt tilstand
- Lag fokuserte stores med ett ansvarsområde
- Bruk immer middleware for nestede tilstandsoppdateringer
- Eksporter selectors sammen med stores for bedre ytelse

### Styling (TailwindCSS)
- Bruk Tailwind utility-klasser direkte i JSX
- Unngå custom CSS med mindre det er absolutt nødvendig
- Bruk Tailwinds responsive og state variants
- Ekstraher gjentatte mønstre til delte komponenter

### Skjemaer (React Hook Form + Zod)
- Definer Zod-schemas for skjemavalidering
- Bruk `zodResolver` med React Hook Form
- Hold valideringslogikk i schemas, ikke i komponenter
- Eksempel:
  ```typescript
  const schema = z.object({
    felt: z.string().min(1)
  });
  const { register, handleSubmit } = useForm<EksempelFormData>({
    resolver: zodResolver(schema)
  });
  ```

### Datahenting (TanStack Query)
- Bruk `useQuery` for GET-forespørsler
- Bruk `useMutation` for POST/PUT/PATCH/DELETE-operasjoner
- Implementer riktig feilhåndtering og lastetilstander
- Utnytt query-invalidering for cache-oppdateringer
- Hold query keys konsistente og organiserte

## Filorganisering
- Organiser innholdet i mapper etter feature/domene
- Hver feature-mappe skal inneholde sine komponenter, hooks og stiler

## Beste praksis
- Foretrekk funksjonelle komponenter med hooks
- Hold komponenter små og fokuserte
- Bruk custom hooks for gjenbrukbar logikk
- Skriv selvdokumenterende kode med tydelige navn
- Håndter laste- og feiltilstander konsekvent

---
**Merknad**: Dette dokumentet beskriver gjeldende arkitektur under aktive migreringer.