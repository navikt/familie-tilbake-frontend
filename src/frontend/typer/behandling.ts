import type { BehandlingsresultatstypeEnum } from '../generated';

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

export enum Behandlingssteg {
    Varsel = 'VARSEL',
    Grunnlag = 'GRUNNLAG',
    Verge = 'VERGE',
    Brevmottaker = 'BREVMOTTAKER',
    Fakta = 'FAKTA',
    Foreldelse = 'FORELDELSE',
    Vilkårsvurdering = 'VILKÅRSVURDERING',
    ForeslåVedtak = 'FORESLÅ_VEDTAK',
    FatteVedtak = 'FATTE_VEDTAK',
    IverksettVedtak = 'IVERKSETT_VEDTAK',
    Avsluttet = 'AVSLUTTET',
    Forhåndsvarsel = 'FORHÅNDSVARSEL',
}

export const behandlingssteg: Record<Behandlingssteg, string> = {
    [Behandlingssteg.Varsel]: 'Varsel',
    [Behandlingssteg.Grunnlag]: 'Kravgrunnlag',
    [Behandlingssteg.Verge]: 'Verge',
    [Behandlingssteg.Brevmottaker]: 'Brevmottaker',
    [Behandlingssteg.Fakta]: 'Fakta fra feilutbetalingssaken',
    [Behandlingssteg.Foreldelse]: 'Foreldelse',
    [Behandlingssteg.Vilkårsvurdering]: 'Tilbakekreving',
    [Behandlingssteg.ForeslåVedtak]: 'Vedtak',
    [Behandlingssteg.FatteVedtak]: 'Fatte vedtak',
    [Behandlingssteg.IverksettVedtak]: 'Iverksetter vedtak',
    [Behandlingssteg.Avsluttet]: 'Avsluttet',
    [Behandlingssteg.Forhåndsvarsel]: 'Forhåndsvarsel',
};

export enum Behandlingsstegstatus {
    Venter = 'VENTER',
    Klar = 'KLAR',
    Utført = 'UTFØRT',
    Autoutført = 'AUTOUTFØRT',
    Tilbakeført = 'TILBAKEFØRT',
    Avbrutt = 'AVBRUTT',
}

export enum Venteårsak {
    VentPåBrukertilbakemelding = 'VENT_PÅ_BRUKERTILBAKEMELDING',
    VentPåTilbakekrevingsgrunnlag = 'VENT_PÅ_TILBAKEKREVINGSGRUNNLAG',
    AvventerDokumentasjon = 'AVVENTER_DOKUMENTASJON',
    UtvidetTilsvarFrist = 'UTVIDET_TILSVAR_FRIST',
    EndreTilkjentYtelse = 'ENDRE_TILKJENT_YTELSE',
    VentPåMuligMotregning = 'VENT_PÅ_MULIG_MOTREGNING',
}

export const manuelleVenteÅrsaker = [
    Venteårsak.AvventerDokumentasjon,
    Venteårsak.UtvidetTilsvarFrist,
    Venteårsak.EndreTilkjentYtelse,
    Venteårsak.VentPåMuligMotregning,
];

export const venteårsaker: Record<Venteårsak, string> = {
    [Venteårsak.VentPåBrukertilbakemelding]: 'Venter på tilbakemelding fra bruker',
    [Venteårsak.VentPåTilbakekrevingsgrunnlag]: 'Venter på tilbakekrevingsgrunnlag fra økonomi',
    [Venteårsak.AvventerDokumentasjon]: 'Avventer dokumentasjon',
    [Venteårsak.UtvidetTilsvarFrist]: 'Bruker har fått utvidet tilsvarsfrist',
    [Venteårsak.EndreTilkjentYtelse]: 'Mulig endring i tilkjent ytelse',
    [Venteårsak.VentPåMuligMotregning]: 'Mulig motregning med annen ytelse',
};

export type Behandlingsstegstilstand = {
    behandlingssteg: Behandlingssteg;
    behandlingsstegstatus: Behandlingsstegstatus;
    venteårsak?: Venteårsak;
    tidsfrist?: string;
};
