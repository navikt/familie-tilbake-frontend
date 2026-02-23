import type {
    BehandlingsresultatstypeEnum,
    BehandlingsstegEnum,
    BehandlingstatusEnum,
    GetårsakstypeEnum,
    VenteårsakEnum,
} from '~/generated';

export const behandlingsårsaker: Record<GetårsakstypeEnum, string> = {
    REVURDERING_KLAGE_NFP: 'Klage tilbakekreving NFP/ NAY omgjør vedtak',
    REVURDERING_KLAGE_KA: 'Revurdering etter KA-behandlet klage',
    REVURDERING_OPPLYSNINGER_OM_VILKÅR: 'Nye opplysninger om vilkårsvurdering',
    REVURDERING_OPPLYSNINGER_OM_FORELDELSE: 'Nye opplysninger om foreldelse',
    REVURDERING_FEILUTBETALT_BELØP_HELT_ELLER_DELVIS_BORTFALT:
        'Feilutbetalt beløp helt eller delvis bortfalt',
};

export const behandlingsstatuser: Record<BehandlingstatusEnum, string> = {
    OPPRETTET: 'Opprettet',
    UTREDES: 'Utredes',
    FATTER_VEDTAK: 'Fatter vedtak',
    IVERKSETTER_VEDTAK: 'Iverksetter vedtak',
    AVSLUTTET: 'Avsluttet',
};

export const behandlingsresultater: Record<BehandlingsresultatstypeEnum, string> = {
    INGEN_TILBAKEBETALING: 'Ingen tilbakekreving',
    DELVIS_TILBAKEBETALING: 'Delvis tilbakekreving',
    FULL_TILBAKEBETALING: 'Full tilbakebetaling',
    HENLAGT: 'Henlagt',
    HENLAGT_FEILOPPRETTET: 'Henlagt (feilaktig opprettet)',
    HENLAGT_FEILOPPRETTET_MED_BREV: 'Henlagt (feilaktig opprettet), med brev',
    HENLAGT_FEILOPPRETTET_UTEN_BREV: 'Henlagt (feilaktig opprettet)',
    HENLAGT_KRAVGRUNNLAG_NULLSTILT: 'Henlagt (kravgrunnlag nullstilt)',
    HENLAGT_TEKNISK_VEDLIKEHOLD: 'Henlagt (teknisk vedlikehold)',
    HENLAGT_MANGLENDE_KRAVGRUNNLAG: 'Henlagt (manglende kravgrunnlag)',
    IKKE_FASTSATT: 'Ikke fastsatt',
};

export const behandlingssteg: Record<BehandlingsstegEnum, string> = {
    VARSEL: 'Varsel',
    GRUNNLAG: 'Kravgrunnlag',
    VERGE: 'Verge',
    BREVMOTTAKER: 'Brevmottaker',
    FAKTA: 'Fakta fra feilutbetalingssaken',
    FORELDELSE: 'Foreldelse',
    VILKÅRSVURDERING: 'Tilbakekreving',
    FORESLÅ_VEDTAK: 'Vedtak',
    FATTE_VEDTAK: 'Fatte vedtak',
    IVERKSETT_VEDTAK: 'Iverksetter vedtak',
    AVSLUTTET: 'Avsluttet',
    FORHÅNDSVARSEL: 'Forhåndsvarsel',
};

export const manuelleVenteÅrsaker: VenteårsakEnum[] = [
    'AVVENTER_DOKUMENTASJON',
    'UTVIDET_TILSVAR_FRIST',
    'ENDRE_TILKJENT_YTELSE',
    'VENT_PÅ_MULIG_MOTREGNING',
];

export const venteårsaker: Record<VenteårsakEnum, string> = {
    VENT_PÅ_BRUKERTILBAKEMELDING: 'Venter på tilbakemelding fra bruker',
    VENT_PÅ_TILBAKEKREVINGSGRUNNLAG: 'Venter på tilbakekrevingsgrunnlag fra økonomi',
    AVVENTER_DOKUMENTASJON: 'Avventer dokumentasjon',
    UTVIDET_TILSVAR_FRIST: 'Bruker har fått utvidet tilsvarsfrist',
    ENDRE_TILKJENT_YTELSE: 'Mulig endring i tilkjent ytelse',
    VENT_PÅ_MULIG_MOTREGNING: 'Mulig motregning med annen ytelse',
    MANGLER_STØTTE: 'Mangler støtte',
};
