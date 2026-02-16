import type {
    BehandlingsresultatstypeEnum,
    BehandlingsstegEnum,
    VenteårsakEnum,
} from '../generated';

export enum Behandlingårsak {
    RevurderingKlageNfp = 'REVURDERING_KLAGE_NFP',
    RevurderingKlageKa = 'REVURDERING_KLAGE_KA',
    RevurderingOpplysningerOmVilkår = 'REVURDERING_OPPLYSNINGER_OM_VILKÅR',
    RevurderingOpplysningerOmForeldelse = 'REVURDERING_OPPLYSNINGER_OM_FORELDELSE',
    RevurderingFeilutbetaltBeløpHeltEllerDelvisBortfalt = 'REVURDERING_FEILUTBETALT_BELØP_HELT_ELLER_DELVIS_BORTFALT',
}

export const behandlingårsaker: Record<Behandlingårsak, string> = {
    [Behandlingårsak.RevurderingKlageNfp]: 'Klage tilbakekreving NFP/ NAY omgjør vedtak',
    [Behandlingårsak.RevurderingKlageKa]: 'Revurdering etter KA-behandlet klage',
    [Behandlingårsak.RevurderingOpplysningerOmVilkår]: 'Nye opplysninger om vilkårsvurdering',
    [Behandlingårsak.RevurderingOpplysningerOmForeldelse]: 'Nye opplysninger om foreldelse',
    [Behandlingårsak.RevurderingFeilutbetaltBeløpHeltEllerDelvisBortfalt]:
        'Feilutbetalt beløp helt eller delvis bortfalt',
};

export const behandlingÅrsaker = [
    Behandlingårsak.RevurderingKlageNfp,
    Behandlingårsak.RevurderingKlageKa,
    Behandlingårsak.RevurderingOpplysningerOmVilkår,
    Behandlingårsak.RevurderingOpplysningerOmForeldelse,
    Behandlingårsak.RevurderingFeilutbetaltBeløpHeltEllerDelvisBortfalt,
];

export enum Behandlingstatus {
    Opprettet = 'OPPRETTET',
    Utredes = 'UTREDES',
    FatterVedtak = 'FATTER_VEDTAK',
    IverksetterVedtak = 'IVERKSETTER_VEDTAK',
    Avsluttet = 'AVSLUTTET',
}

export const behandlingsstatuser: Record<Behandlingstatus, string> = {
    [Behandlingstatus.Opprettet]: 'Opprettet',
    [Behandlingstatus.Utredes]: 'Utredes',
    [Behandlingstatus.FatterVedtak]: 'Fatter vedtak',
    [Behandlingstatus.IverksetterVedtak]: 'Iverksetter vedtak',
    [Behandlingstatus.Avsluttet]: 'Avsluttet',
};

export enum Behandlingresultat {
    IngenTilbakebetaling = 'INGEN_TILBAKEBETALING',
    DelvisTilbakebetaling = 'DELVIS_TILBAKEBETALING',
    FullTilbakebetaling = 'FULL_TILBAKEBETALING',
    Henlagt = 'HENLAGT',
    HenlagtFeilopprettet = 'HENLAGT_FEILOPPRETTET',
    HenlagtFeilopprettetMedBrev = 'HENLAGT_FEILOPPRETTET_MED_BREV',
    HenlagtFeilopprettetUtenBrev = 'HENLAGT_FEILOPPRETTET_UTEN_BREV',
    IkkeFastsatt = 'IKKE_FASTSATT',
}

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

export enum Saksbehandlingstype {
    Ordinær = 'ORDINÆR',
    AutomatiskIkkeInnkrevingLavtBeløp = 'AUTOMATISK_IKKE_INNKREVING_LAVT_BELØP',
    AutomatiskIkkeInnkrevingUnder4XRettsgebyr = 'AUTOMATISK_IKKE_INNKREVING_UNDER_4X_RETTSGEBYR',
}

export enum Behandlingstype {
    Tilbakekreving = 'TILBAKEKREVING',
    RevurderingTilbakekreving = 'REVURDERING_TILBAKEKREVING',
}

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
