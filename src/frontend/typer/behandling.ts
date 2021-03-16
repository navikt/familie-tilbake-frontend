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
    INGEN_TILBAKEKREVING = 'INGEN_TILBAKEKREVING',
    DELVIS_TILBAKEKREVING = 'DELVIS_TILBAKEKREVING',
    FULL_TILBAKEKREVING = 'FULL_TILBAKEKREVING',
    HENLAGT = 'HENLAGT',
    HENLAGT_FEILAKTIG_OPPRETTET = 'HENLAGT_FEILAKTIG_OPPRETTET',
    IKKE_VURDERT = 'IKKE_VURDERT',
}

export const behandlingsresultater: Record<Behandlingresultat, string> = {
    INGEN_TILBAKEKREVING: 'Ingen tilbakekreving',
    DELVIS_TILBAKEKREVING: 'Delvis tilbakekreving',
    FULL_TILBAKEKREVING: 'Fortsatt innvilget',
    HENLAGT: 'Henlagt',
    HENLAGT_FEILAKTIG_OPPRETTET: 'Henlagt (feilaktig opprettet)',
    IKKE_VURDERT: 'Ikke vurdert',
};

export enum Behandlingstype {
    TILBAKEKREVING = 'TILBAKEKREVING',
    REVURDERING_TILBAKEKREVING = 'REVURDERING_TILBAKEKREVING',
}

export const behandlingstyper: Record<Behandlingstype, string> = {
    TILBAKEKREVING: 'Tilbakekreving',
    REVURDERING_TILBAKEKREVING: 'Revurdering tilbakekreving',
};

export interface IBehandling {
    behandlingId: string;
    aktiv: boolean;
    //    begrunnelse: string;
    eksternBrukId: string;
    //    endretAv: string;
    //    kategori: BehandlingKategori;
    opprettetDato: string;
    //    personResultater: IRestPersonResultat[];
    //    personer: IGrunnlagPerson[];
    resultatstype?: Behandlingresultat;
    status: Behandlingstatus;
    //    steg: BehandlingSteg;
    //    stegTilstand: IRestStegTilstand[];
    //    totrinnskontroll?: ITotrinnskontroll;
    //    opplysningsplikt?: IOpplysningsplikt;
    type: Behandlingstype;
    //    underkategori: BehandlingUnderkategori;
    //    vedtakForBehandling: IVedtakForBehandling[];
    //    utbetalingsperioder: IUtbetalingsperiode[];
    //    personerMedAndelerTilkjentYtelse: IPersonMedAndelerTilkjentYtelse[];
    årsak?: Behandlingårsak;
    //    skalBehandlesAutomatisk: boolean;
    harVerge: boolean;
    kanHenleggeBehandling: boolean;
}
