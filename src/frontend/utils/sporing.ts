/**
 * Sporing (produktanalyse) via Umami/Innblikk-løsning fra ResearchOps.
 * Se https://reops-docs.ansatt.dev.nav.no/guider/kom-i-gang-med-sporing/
 *
 * Hendelsesnavn og -egenskaper følger Navs taksonomi for produktanalyse,
 * definert i https://github.com/navikt/analytics-types. Typene er speilet
 * lokalt fordi @navikt/analytics-types ikke er publisert på offentlig npm.
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

/**
 * Hendelsesnavn fra Navs taksonomi. Bruk alltid en av disse framfor
 * egendefinerte navn, slik at data kan sammenliknes på tvers av Nav-løsninger.
 */
export const Hendelser = {
    NAVIGERE: 'navigere',
    KNAPP_KLIKKET: 'knapp klikket',
    MODAL_APNET: 'modal åpnet',
    ACTIONMENU_VALG_VALGT: 'actionmenu valg valgt',
    TOGGLEGROUP_VALGT: 'togglegroup valgt',
    STEPPER_STEG_ENDRET: 'stepper steg endret',
    TEKST_KOPIERT: 'tekst kopiert',
    UTVIDBART_KORT_APNET: 'utvidbart kort åpnet',
    UTVIDBART_KORT_LUKKET: 'utvidbart kort lukket',
} as const;

type Basisegenskaper = {
    kontekst?: string;
    komponentId?: string;
    seksjon?: string;
    innholdstype?: string;
    opprinnelse?: string;
};

type Hendelsesegenskaper = {
    [Hendelser.NAVIGERE]: Basisegenskaper & {
        lenketekst: string;
        destinasjon: string;
        lenkegruppe?: string;
    };
    [Hendelser.KNAPP_KLIKKET]: Basisegenskaper & {
        tekst: string;
    };
    [Hendelser.MODAL_APNET]: Basisegenskaper & {
        tittel?: string;
    };
    [Hendelser.ACTIONMENU_VALG_VALGT]: Basisegenskaper & {
        valgTekst: string;
        valgId?: string;
        valgType?: 'item' | 'checkbox' | 'radio' | 'subtrigger';
    };
    [Hendelser.TOGGLEGROUP_VALGT]: Basisegenskaper & {
        valgtVerdi: string;
    };
    [Hendelser.STEPPER_STEG_ENDRET]: Basisegenskaper & {
        stegId?: string;
        stegIndeks: number;
        totaltAntallSteg: number;
        handling?: 'neste' | 'forrige' | 'hopp';
        retning?: 'fremover' | 'bakover';
        forrigeStegFullfort?: boolean;
    };
    [Hendelser.TEKST_KOPIERT]: Basisegenskaper & {
        /** Feltet som ble kopiert. Aldri selve verdien – den kan være personopplysning. */
        tekst: string;
    };
    [Hendelser.UTVIDBART_KORT_APNET]: Basisegenskaper & {
        tittel: string;
    };
    [Hendelser.UTVIDBART_KORT_LUKKET]: Basisegenskaper & {
        tittel: string;
    };
};

type Hendelsesnavn = keyof Hendelsesegenskaper;

export const Sporingskontekst = {
    Header: 'header',
    Sidebar: 'sidebar',
    Behandling: 'behandling',
    ActionBar: 'actionbar',
    Forhåndsvarsel: 'forhåndsvarsel',
    Vedtak: 'vedtak',
} as const;

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
    document.head.appendChild(script);
};

/**
 * Sporer en hendelse fra Navs taksonomi med tilhørende hendelsesdetaljer.
 * Alle hendelser beriket automatisk med gjeldende ytelsestype (settes via
 * settSporingsYtelsestype fra FagsakProvider)
 */
export const sporHendelse = <THendelse extends Hendelsesnavn>(
    navn: THendelse,
    egenskaper: Hendelsesegenskaper[THendelse]
): void => {
    const beriketData: Record<string, unknown> = {};

    if (gjeldendeYtelsestype) {
        beriketData.ytelsestype = gjeldendeYtelsestype;
    }

    Object.assign(beriketData, egenskaper);

    hentSporing()?.track(standardPayload => ({
        ...standardPayload,
        name: navn,
        data: Object.keys(beriketData).length > 0 ? beriketData : undefined,
        url: `${window.location.pathname}${window.location.search}`,
    }));
};
