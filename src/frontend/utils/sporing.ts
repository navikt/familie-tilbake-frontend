/**
 * Sporing (produktanalyse) via Umami/Innblikk-løsning fra ResearchOps.
 * Se https://reops-docs.ansatt.dev.nav.no/guider/kom-i-gang-med-sporing/
 */
import type { SchemaEnum4 } from '@/generated/types.gen';

type Sporingsoppsett = {
    websiteId: string;
    skriptUrl: string;
};

// Sporingskode og skript hentet fra Innblikk (innblikk.ansatt.dev.nav.no/sporingskoder)
const SPORING_DEV: Sporingsoppsett = {
    websiteId: 'd955fe48-a9ac-4930-a6aa-a9dfb084ec2b',
    skriptUrl: 'https://cdn.nav.no/team-researchops/sporing/sporing-dev.js',
};

// Minimal type for det vi faktisk bruker av sporingsskriptets API. Holdes lokal
// (ikke global augmentering av Window) slik at resten av koden går via
// sporHendelse i stedet for å røre window.sporing direkte.
type SporingPayload = Record<string, unknown> & {
    name?: string;
    data?: Record<string, unknown>;
    url?: string;
};

type SporingApi = {
    track: (byggPayload: (standardPayload: SporingPayload) => SporingPayload) => void;
};

const hentSporing = (): SporingApi | undefined =>
    (window as Window & { sporing?: SporingApi }).sporing;

const erDev = (): boolean => window.location.hostname.indexOf('dev.nav.no') > -1;

let gjeldendeYtelsestype: SchemaEnum4 | undefined;

export const settSporingsYtelsestype = (ytelsestype: SchemaEnum4 | undefined): void => {
    gjeldendeYtelsestype = ytelsestype;
};

const hentSporingsoppsett = (): Sporingsoppsett | undefined => {
    if (erDev()) {
        return SPORING_DEV;
    }

    // TODO: Registrer appen i Innblikk prod og legg til et SPORING_PROD-oppsett
    // (sporing.js + prod-sporingskode) som returneres her for intern.nav.no.
    return undefined;
};

let trackerLoaded = false;

export const loadTracker = (): void => {
    const oppsett = hentSporingsoppsett();

    if (!oppsett || trackerLoaded) {
        return;
    }

    trackerLoaded = true;

    const script = document.createElement('script');
    script.defer = true;
    script.src = oppsett.skriptUrl;
    script.setAttribute('data-website-id', oppsett.websiteId);
    script.setAttribute('data-auto-track', 'false');
    document.head.appendChild(script);
};

/**
 * Sporer en egendefinert hendelse (custom event) med valgfrie data-egenskaper.
 * Alle hendelser beriket automatisk med gjeldende ytelsestype (settes via
 * settSporingsYtelsestype fra FagsakProvider)
 */
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
