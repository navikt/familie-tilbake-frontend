// Sporing (produktanalyse) via NAVs Umami/Innblikk-løsning fra ResearchOps.
// Se https://reops-docs.ansatt.dev.nav.no/guider/kom-i-gang-med-sporing/
//
// Applikasjonen er et internt saksbehandlerverktøy bak innlogging og krever
// derfor ikke cookie-samtykke (jf. guiden om interne verktøy for Nav-ansatte).
//
// Base-scriptet (sporing.js) ruter automatisk til riktig event-proxy basert på
// hostname (dev vs. prod), så vi trenger kun å oppgi riktig data-website-id per
// miljø. Vi bruker data-auto-track="false" og sporer sidevisninger manuelt ved
// hvert route-bytte, siden dette er en SPA med React Router.

const SPORING_SKRIPT_URL = 'https://cdn.nav.no/team-researchops/sporing/sporing.js';

// Unik sporingskode per miljø, hentet fra Innblikk (innblikk.ansatt.(dev.)nav.no/sporingskoder).
enum SporingWebsiteId {
    Dev = '226376e1-7fdd-47df-bb34-31d7ba1c5c9f',
    // Prod = '<ikke registrert i Innblikk prod ennå>',
}

declare global {
    interface Window {
        sporing?: {
            track: (
                navnEllerData?: string | Record<string, unknown>,
                data?: Record<string, unknown>
            ) => void;
            identify: (
                id: string | Record<string, unknown>,
                data?: Record<string, unknown>
            ) => void;
        };
    }
}

const erDev = (): boolean => window.location.hostname.indexOf('dev.nav.no') > -1;

const hentWebsiteId = (): string | undefined => {
    if (erDev()) {
        return SporingWebsiteId.Dev;
    }

    // TODO: Registrer appen i Innblikk prod, legg til SporingWebsiteId.Prod og
    // returner den her når hostname er intern.nav.no (prod).
    return undefined;
};

let skriptLastet = false;

// Ytelsestype (f.eks. BARNETRYGD) som festes på alle custom events. Settes fra
// FagsakProvider når en fagsak er lastet, og nullstilles når man forlater den.
let gjeldendeYtelsestype: string | undefined;

export const settSporingsYtelsestype = (ytelsestype: string | undefined): void => {
    gjeldendeYtelsestype = ytelsestype;
};

export const initSporing = (): void => {
    const websiteId = hentWebsiteId();

    if (!websiteId || skriptLastet) {
        return;
    }

    skriptLastet = true;

    const script = document.createElement('script');
    script.defer = true;
    script.src = SPORING_SKRIPT_URL;
    script.setAttribute('data-website-id', websiteId);
    script.setAttribute('data-auto-track', 'false');
    document.head.appendChild(script);
};

const MAKS_FORSØK = 20;

export const sporSidevisning = (forsøk = 0): void => {
    if (window.sporing?.track) {
        window.sporing.track();
        return;
    }

    // Scriptet lastes med defer og kan være ferdig lastet litt etter første
    // route-render. Prøv igjen kort tid etterpå til det er tilgjengelig.
    if (forsøk < MAKS_FORSØK) {
        window.setTimeout(() => sporSidevisning(forsøk + 1), 250);
    }
};

// Sporer en egendefinert hendelse (custom event) med valgfrie data-egenskaper.
// Alle hendelser beriket automatisk med gjeldende ytelsestype (settes via
// settSporingsYtelsestype fra FagsakProvider). Gjør ingenting dersom
// sporingsskriptet ikke er lastet (f.eks. lokalt).
export const sporHendelse = (navn: string, data?: Record<string, unknown>): void => {
    const beriketData: Record<string, unknown> = {};

    if (gjeldendeYtelsestype) {
        beriketData.ytelsestype = gjeldendeYtelsestype;
    }

    Object.assign(beriketData, data);

    window.sporing?.track(navn, Object.keys(beriketData).length > 0 ? beriketData : undefined);
};
