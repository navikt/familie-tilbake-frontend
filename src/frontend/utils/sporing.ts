// Sporing (produktanalyse) via NAVs Umami/Innblikk-løsning fra ResearchOps.
// Se https://reops-docs.ansatt.dev.nav.no/guider/kom-i-gang-med-sporing/
//
// Applikasjonen er et internt saksbehandlerverktøy bak innlogging og krever
// derfor ikke cookie-samtykke (jf. guiden om interne verktøy for Nav-ansatte).
//
// Base-scriptet (sporing.js) ruter automatisk til riktig event-proxy basert på
// hostname (dev vs. prod), så vi trenger kun å oppgi riktig data-website-id per
// miljø.
//
// Vi bruker data-auto-track="false" og sporer kun eksplisitte hendelser via
// sporHendelse (f.eks. menyvalg). Sidevisninger spores altså ikke.
//
// Merk: når auto-sporing er av, kjører skriptet aldri init(), og URL-en i
// payloaden fryses til den siden appen ble lastet på. Vi setter derfor url
// eksplisitt ved hvert kall, slik at hendelsene knyttes til riktig side.

// Unik sporingskode per miljø, hentet fra Innblikk (innblikk.ansatt.(dev.)nav.no/sporingskoder).
enum SporingWebsiteId {
    Dev = '226376e1-7fdd-47df-bb34-31d7ba1c5c9f',
    // Prod = '<ikke registrert i Innblikk prod ennå>',
}

// Minimal type for det vi faktisk bruker av sporingsskriptets API. Holdes lokal
// (ikke global augmentering av Window) slik at resten av koden går via
// sporHendelse i stedet for å røre window.sporing direkte.
type SporingPayload = Record<string, unknown> & {
    name?: string;
    data?: Record<string, unknown>;
    url?: string;
};

type SporingApi = {
    // Funksjonsformen gir oss skriptets standardpayload, slik at vi kan
    // overstyre felter (bl.a. url) før hendelsen sendes.
    track: (byggPayload: (standardPayload: SporingPayload) => SporingPayload) => void;
};

const hentSporing = (): SporingApi | undefined =>
    (window as Window & { sporing?: SporingApi }).sporing;

const erDev = (): boolean => window.location.hostname.indexOf('dev.nav.no') > -1;

// Ytelsestype (f.eks. BARNETRYGD) som festes på alle custom events. Settes fra
// FagsakProvider når en fagsak er lastet, og nullstilles når man forlater den.
let gjeldendeYtelsestype: string | undefined;

export const settSporingsYtelsestype = (ytelsestype: string | undefined): void => {
    gjeldendeYtelsestype = ytelsestype;
};

const hentWebsiteId = (): string | undefined => {
    if (erDev()) {
        return SporingWebsiteId.Dev;
    }

    // TODO: Registrer appen i Innblikk prod, legg til SporingWebsiteId.Prod og
    // returner den her når hostname er intern.nav.no (prod).
    return undefined;
};

let trackerLoaded = false;

export const loadTracker = (): void => {
    const websiteId = hentWebsiteId();

    if (!websiteId || trackerLoaded) {
        return;
    }

    trackerLoaded = true;

    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://cdn.nav.no/team-researchops/sporing/sporing.js';
    script.setAttribute('data-website-id', websiteId);
    script.setAttribute('data-auto-track', 'false');
    document.head.appendChild(script);
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

    hentSporing()?.track(standardPayload => ({
        ...standardPayload,
        name: navn,
        data: Object.keys(beriketData).length > 0 ? beriketData : undefined,
        url: `${window.location.pathname}${window.location.search}`,
    }));
};
