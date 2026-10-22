# familie-tilbake-frontend

[![Build&deploy to dev](https://github.com/navikt/familie-tilbake-frontend/actions/workflows/build_n_deploy_dev.yaml/badge.svg)](https://github.com/navikt/familie-tilbake-frontend/actions/workflows/build_n_deploy_dev.yaml) [![Build&deploy to dev and prod](https://github.com/navikt/familie-tilbake-frontend/actions/workflows/build_n_deploy_prod.yaml/badge.svg)](https://github.com/navikt/familie-tilbake-frontend/actions/workflows/build_n_deploy_prod.yaml) [![Build PR](https://github.com/navikt/familie-tilbake-frontend/actions/workflows/build.yaml/badge.svg)](https://github.com/navikt/familie-tilbake-frontend/actions/workflows/build.yaml)

Saksbehandlerapplikasjon for tilbakekreving etter folketrygdloven § 22-15. Applikasjonen støtter ytelsene barnetrygd, kontantstøtte, støtte til enslig forsørger, tilleggsstønader og arbeidsavklaringspenger (AAP).

---

## Innholdsfortegnelse

- [Tech stack](#tech-stack)
- [Forutsetninger](#forutsetninger)
- [Kom i gang](#kom-i-gang)
- [Miljøvariabler](#miljøvariabler)
- [Scripts](#scripts)
- [Prosjektstruktur](#prosjektstruktur)
- [Arkitektur](#arkitektur)
- [API-generering](#api-generering)
- [Testing](#testing)
- [Kodekvalitet](#kodekvalitet)
- [Relaterte repoer](#relaterte-repoer)
- [Henvendelser](#henvendelser)

---

## Tech stack

| Kategori | Teknologi |
| --- | --- |
| Rammeverk | React 19 |
| Språk | TypeScript (strict mode) |
| Build | Vite |
| Routing | React Router 7 |
| Server state | TanStack Query |
| Client state | Zustand |
| Styling | Tailwind CSS + [NAV Design System](https://aksel.nav.no/) |
| Skjemaer | React Hook Form + Zod |
| HTTP-klient | Axios |
| API-generering | @hey-api/openapi-ts |
| BFF | Node.js / Express |
| Testing | Vitest + React Testing Library |
| Monitorering | NAIS APM, Prometheus |
| Container | Distroless Node.js 24 |
| Pakkebehandler | pnpm |

## Forutsetninger

- [Node.js](https://nodejs.org/) >= 24 (LTS)
- [pnpm](https://pnpm.io/installation) >= 11
- [Docker](https://www.docker.com/) eller [Colima](https://github.com/abiosoft/colima) (for Redis, Wonderwall og Texas)
- Tilgang til NAVs GitHub Package Registry (`@navikt`-pakker)

## Kom i gang

### 1. Installer avhengigheter

Pakken `@nais/apm` hentes fra GitHub Packages. Konfigurer pnpm én gang med en GitHub PAT som har `read:packages`-tilgang. Lokalt kan den eksisterende `GITHUB_TOKEN`-variabelen brukes:

```bash
pnpm config set //npm.pkg.github.com/:_authToken "$GITHUB_TOKEN" --location=user
```

I GitHub Actions brukes den innebygde `GITHUB_TOKEN` med `packages: read`.

```bash
pnpm install
```

### 2. Sett opp miljøvariabler

```bash
bash hent-og-lagre-miljøvariabler.sh
```

Skriptet henter lokal Entra ID-konfigurasjon fra [localauth](https://github.com/navikt/localauth) uten å hente eller lagre reelle secrets. Du må være på NAV-nettverket for å nå tjenesten. Localauth deployes separat til dev-gcp fra `.nais/localauth.yaml` ved å kjøre GitHub Actions-workflowen **Deploy localauth til dev** manuelt. Den deployes ikke ved vanlige frontend-endringer.

### 3. Start Docker-tjenester

Start Redis, Wonderwall (autentisering) og Texas (token-tjeneste):

```bash
docker compose up
```

### 4. Start utviklingsserver

```bash
pnpm start:dev
```

Bundler backend (esbuild → `node_dist/server.js`) og starter Express-serveren på port `8000`. Wonderwall eksponerer applikasjonen på [http://localhost:4000](http://localhost:4000).

### 5. Start backend-API

Som standard går lokal frontend mot dev-backend. For å bruke backend lokalt i stedet, endre `ENV` til `local` og `TILBAKE_SCOPE` til `api://dev-gcp.tilbake.tilbakekreving-backend-lokal/.default` i `.env`. Start da [familie-tilbake](https://github.com/navikt/familie-tilbake) lokalt med `LauncherLocalPostgres`. For testdata, se [familie-tilbake-e2e](https://github.com/navikt/familie-tilbake-e2e).

## Miljøvariabler

Lokal innloggingskonfigurasjon genereres fra localauth via `hent-og-lagre-miljøvariabler.sh` og lagres i `.login.env`. Øvrige lokale innstillinger lagres i `.env`. Ingen reelle Entra ID-secrets lastes ned.

Skriptet setter dev-backend som standard. For å kjøre mot backend lokalt, bruk:

```env
ENV=local
TILBAKE_SCOPE=api://dev-gcp.tilbake.tilbakekreving-backend-lokal/.default
```

## Scripts

| Kommando | Beskrivelse |
| --- | --- |
| `pnpm start:dev` | Bundle backend med esbuild og start utviklingsserver |
| `pnpm build` | Sjekk (Biome) + produksjonsbygg (server + klient) |
| `pnpm build:client` | Bygg frontend med Vite |
| `pnpm build:server` | Bundle backend til én fil med esbuild |
| `pnpm test` | Kjør tester med Vitest |
| `pnpm test:watch` | Kjør tester i watch-modus |
| `pnpm check` | Kjør Biome read-only: linting + formatsjekk + import-sortering (skriver ingenting) |
| `pnpm check:fix` | Kjør Biome med automatisk fiks: formatterer, fikser lint-regler (safe) og sorterer imports |
| `pnpm generate-types` | Generer TypeScript-typer, React Query hooks og Zod-schemas fra OpenAPI-spec |

## Prosjektstruktur

```
src/
├── backend/               # Node.js BFF (Express)
│   ├── backend/auth/      # Autentisering og sesjonshåndtering
│   ├── config.ts          # App- og sesjonskonfigurasjon
│   ├── proxy.ts           # API-proxy til familie-tilbake
│   ├── router.ts          # Express-ruter
│   └── server.ts          # Server entry point (port 8000)
│
└── frontend/              # React SPA
    ├── api/               # HTTP-klient og Axios-konfigurasjon
    ├── context/           # React Context providers
    ├── generated/         # Auto-generert fra OpenAPI-spec
    ├── hooks/             # Custom React hooks
    ├── kodeverk/          # Kodetabeller og enums
    ├── komponenter/       # React-komponenter
    ├── pages/             # Route-sider
    ├── stores/            # Zustand stores
    ├── typer/             # TypeScript-typer
    └── utils/             # Utility-funksjoner
```

## Arkitektur

Applikasjonen bruker et **BFF-mønster** (Backend for Frontend) der en Node.js/Express-server håndterer autentisering, sesjonshåndtering og proxy til backend-API-et.

```
Nettleser → Wonderwall (auth) → Express BFF (port 8000) → familie-tilbake API
                                      ↕
                                Redis (sesjon)
                                Texas (tokens)
```

- **Wonderwall** håndterer innlogging via Azure AD og eksponerer appen på port 4000
- **Express BFF** fester access tokens på utgående requests og proxyer `/familie-tilbake/api` til backend
- **Redis** lagrer sesjonsdata
- **Texas** utsteder tokens for backend-kommunikasjon

## API-generering

TypeScript-typer, React Query hooks og Zod-schemas genereres automatisk fra OpenAPI-spec via [`@hey-api/openapi-ts`](https://heyapi.dev/):

```bash
pnpm generate-types
```

Konfigurasjon finnes i `openapi-ts.config.ts`. Generert kode skrives til `src/frontend/generated/` og skal ikke redigeres manuelt.

## Testing

Testene kjører med [Vitest](https://vitest.dev/) og [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) i et jsdom-miljø.

```bash
pnpm test           # Kjør alle tester
pnpm test:watch     # Watch-modus
```

## Kodekvalitet

- **Biome** for linting, formatering og import-sortering (erstatter ESLint + Prettier)
- **Husky** + **lint-staged** kjører Biome automatisk ved commit
- `pnpm typecheck` kjører `tsc --noEmit` (Biome typesjekker ikke)
- Path alias `@/` peker til `src/frontend/` — dype relative imports (`../../../`) er blokkert via Biome (`noRestrictedImports`)
- Kjør `npx knip` for å se ubrukt kode. Satt opp med `./knip.config.ts`.

## Relaterte repoer

| Repo | Beskrivelse |
| --- | --- |
| [familie-tilbake](https://github.com/navikt/familie-tilbake) | Backend-API (Kotlin/Spring) |
| [familie-tilbake-e2e](https://github.com/navikt/familie-tilbake-e2e) | End-to-end tester |
| [tilbakekreving-kontrakter](https://github.com/navikt/tilbakekreving-kontrakter) | TypeSpec-kontrakter for API |
|[tilbakekreving-typst](https://github.com/navikt/tilbakekreving-pdf-typst)| Typst generering av brev |
|[tilbakekreving-burde-forstått](https://github.com/navikt/tilbakekreving-burde-forstatt)| Test-data generering |

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.

For NAV-ansatte kan interne henvendelser sendes via Slack i kanalen [#team-tilbake-vær-så-god](https://nav-it.slack.com/archives/team-tilbake-vær-så-god).

---

## Lisens

[MIT](LICENSE)

## Kode generert av GitHub Copilot

Dette repoet bruker GitHub Copilot til å generere kode.
