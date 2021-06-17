export enum Behandlingårsak {
    SØKNAD = 'SØKNAD',
    FØDSELSHENDELSE = 'FØDSELSHENDELSE',
    ÅRLIG_KONTROLL = 'ÅRLIG_KONTROLL',
    DØDSFALL = 'DØDSFALL',
    NYE_OPPLYSNINGER = 'NYE_OPPLYSNINGER',
    TEKNISK_OPPHØR = 'TEKNISK_OPPHØR',
    OMREGNING_6ÅR = 'OMREGNING_6ÅR',
    OMREGNING_18ÅR = 'OMREGNING_18ÅR',
}

export const behandlingårsaker: Record<Behandlingårsak, string> = {
    SØKNAD: 'Søknad',
    FØDSELSHENDELSE: 'Fødselshendelse',
    ÅRLIG_KONTROLL: 'Årlig kontroll',
    DØDSFALL: 'Dødsfall',
    NYE_OPPLYSNINGER: 'Nye opplysninger',
    TEKNISK_OPPHØR: 'Teknisk opphør',
    OMREGNING_6ÅR: 'Omregning 6 år',
    OMREGNING_18ÅR: 'Omregning 18 år',
};

export enum Behandlingstatus {
    OPPRETTET = 'OPPRETTET',
    UTREDES = 'UTREDES',
    FATTER_VEDTAK = 'FATTER_VEDTAK',
    IVERKSETTER_VEDTAK = 'IVERKSETTER_VEDTAK',
    AVSLUTTET = 'AVSLUTTET',
}

export const behandlingsstatuser: Record<Behandlingstatus, string> = {
    OPPRETTET: 'Opprettet',
    UTREDES: 'Utredes',
    FATTER_VEDTAK: 'Fatter vedtak',
    IVERKSETTER_VEDTAK: 'Iverksetter vedtak',
    AVSLUTTET: 'Avsluttet',
};

export enum Behandlingresultat {
    INGEN_TILBAKEBETALING = 'INGEN_TILBAKEBETALING',
    DELVIS_TILBAKEBETALING = 'DELVIS_TILBAKEBETALING',
    FULL_TILBAKEBETALING = 'FULL_TILBAKEBETALING',
    HENLAGT = 'HENLAGT',
    HENLAGT_FEILOPPRETTET = 'HENLAGT_FEILOPPRETTET',
    HENLAGT_FEILOPPRETTET_MED_BREV = 'HENLAGT_FEILOPPRETTET_MED_BREV',
    HENLAGT_FEILOPPRETTET_UTEN_BREV = 'HENLAGT_FEILOPPRETTET_UTEN_BREV',
    IKKE_FASTSATT = 'IKKE_FASTSATT',
}

export const behandlingsresultater: Record<Behandlingresultat, string> = {
    INGEN_TILBAKEBETALING: 'Ingen tilbakekreving',
    DELVIS_TILBAKEBETALING: 'Delvis tilbakekreving',
    FULL_TILBAKEBETALING: 'Full tilbakebetaling',
    HENLAGT: 'Henlagt',
    HENLAGT_FEILOPPRETTET: 'Henlagt (feilaktig opprettet)',
    HENLAGT_FEILOPPRETTET_MED_BREV: 'Henlagt (feilaktig opprettet), med brev',
    HENLAGT_FEILOPPRETTET_UTEN_BREV: 'Henlagt (feilaktig opprettet)',
    IKKE_FASTSATT: 'Ikke fastsatt',
};

export enum Behandlingstype {
    TILBAKEKREVING = 'TILBAKEKREVING',
    REVURDERING_TILBAKEKREVING = 'REVURDERING_TILBAKEKREVING',
}

export const behandlingstyper: Record<Behandlingstype, string> = {
    TILBAKEKREVING: 'Tilbakekreving',
    REVURDERING_TILBAKEKREVING: 'Revurdering tilbakekreving',
};

export enum Behandlingssteg {
    VARSEL = 'VARSEL',
    GRUNNLAG = 'GRUNNLAG',
    VERGE = 'VERGE',
    FAKTA = 'FAKTA',
    FORELDELSE = 'FORELDELSE',
    VILKÅRSVURDERING = 'VILKÅRSVURDERING',
    FORESLÅ_VEDTAK = 'FORESLÅ_VEDTAK',
    FATTE_VEDTAK = 'FATTE_VEDTAK',
    IVERKSETT_VEDTAK = 'IVERKSETT_VEDTAK',
    AVSLUTTET = 'AVSLUTTET',
}

export const behandlingssteg: Record<Behandlingssteg, string> = {
    VARSEL: 'Varsel',
    GRUNNLAG: 'Kravgrunnlag',
    VERGE: 'Verge',
    FAKTA: 'Fakta om feilutbetaling',
    FORELDELSE: 'Foreldelse',
    VILKÅRSVURDERING: 'Tilbakekreving',
    FORESLÅ_VEDTAK: 'Vedtak',
    FATTE_VEDTAK: 'Fatte vedtak',
    IVERKSETT_VEDTAK: 'Iverksetter vedtak',
    AVSLUTTET: 'Avsluttet',
};

export const SaksbehandlerBehandlingssteg = [
    Behandlingssteg.VERGE,
    Behandlingssteg.FAKTA,
    Behandlingssteg.FORELDELSE,
    Behandlingssteg.VILKÅRSVURDERING,
    Behandlingssteg.FORESLÅ_VEDTAK,
    Behandlingssteg.FATTE_VEDTAK,
];

export enum Behandlingsstegstatus {
    STARTET = 'STARTET',
    VENTER = 'VENTER',
    KLAR = 'KLAR',
    UTFØRT = 'UTFØRT',
    AUTOUTFØRT = 'AUTOUTFØRT',
    TILBAKEFØRT = 'TILBAKEFØRT',
    AVBRUTT = 'AVBRUTT',
}

export enum Venteårsak {
    VENT_PÅ_BRUKERTILBAKEMELDING = 'VENT_PÅ_BRUKERTILBAKEMELDING',
    VENT_PÅ_TILBAKEKREVINGSGRUNNLAG = 'VENT_PÅ_TILBAKEKREVINGSGRUNNLAG',
    AVVENTER_DOKUMENTASJON = 'AVVENTER_DOKUMENTASJON',
    UTVIDET_TILSVAR_FRIST = 'UTVIDET_TILSVAR_FRIST',
    ENDRE_TILKJENT_YTELSE = 'ENDRE_TILKJENT_YTELSE',
    VENT_PÅ_MULIG_MOTREGNING = 'VENT_PÅ_MULIG_MOTREGNING',
}

export const manuelleÅrsaker = [
    Venteårsak.AVVENTER_DOKUMENTASJON,
    Venteårsak.UTVIDET_TILSVAR_FRIST,
    Venteårsak.ENDRE_TILKJENT_YTELSE,
    Venteårsak.VENT_PÅ_MULIG_MOTREGNING,
];

export const venteårsaker: Record<Venteårsak, string> = {
    VENT_PÅ_BRUKERTILBAKEMELDING: 'Venter på tilbakemelding fra bruker',
    VENT_PÅ_TILBAKEKREVINGSGRUNNLAG: 'Venter på tilbakekrevingsgrunnlag fra økonomi',
    AVVENTER_DOKUMENTASJON: 'Avventer dokumentasjon',
    UTVIDET_TILSVAR_FRIST: 'Bruker har fått utvidet tilsvarsfrist',
    ENDRE_TILKJENT_YTELSE: 'Mulig endring i tilkjent ytelse',
    VENT_PÅ_MULIG_MOTREGNING: 'Mulig motregning med annen ytelse',
};

export interface IBehandlingsstegstilstand {
    behandlingssteg: Behandlingssteg;
    behandlingsstegstatus: Behandlingsstegstatus;
    venteårsak?: Venteårsak;
    tidsfrist?: string;
}

export interface IBehandling {
    behandlingId: string;
    eksternBrukId: string;
    opprettetDato: string;
    avsluttetDato?: string;
    enhetskode?: string;
    resultatstype?: Behandlingresultat;
    status: Behandlingstatus;
    type: Behandlingstype;
    årsak?: Behandlingårsak;
    erBehandlingHenlagt?: boolean;
    erBehandlingPåVent?: boolean;
    kanEndres: boolean;
    harVerge: boolean;
    kanHenleggeBehandling: boolean;
    varselSendt: boolean;
    behandlingsstegsinfo: IBehandlingsstegstilstand[];
    fagsystemsbehandlingId: string;
}
