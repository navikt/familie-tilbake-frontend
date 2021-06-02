export enum Aktør {
    SAKSBEHANDLER = 'SAKSBEHANDLER',
    BESLUTTER = 'BESLUTTER',
    VEDTAKSLØSNING = 'VEDTAKSLØSNING',
}

export const aktører: Record<Aktør, string> = {
    SAKSBEHANDLER: 'Saksbehandler',
    BESLUTTER: 'Beslutter',
    VEDTAKSLØSNING: 'Vedtaksløsningen',
};

export enum Historikkinnslagstype {
    HENDELSE = 'HENDELSE',
    SKJERMLENKE = 'SKJERMLENKE',
    BREV = 'BREV',
}

export enum Applikasjon {
    FAMILIE_TILBAKE = 'FAMILIE_TILBAKE',
}

export const applikasjoner: Record<Applikasjon, string> = {
    FAMILIE_TILBAKE: 'familie-tilbake',
};

export interface IHistorikkInnslag {
    behandlingId?: string;
    applikasjon: Applikasjon;
    aktør: Aktør;
    aktørIdent: string;
    tittel: string;
    tekst?: string;
    type: Historikkinnslagstype;
    steg?: string;
    journalpostId?: string;
    dokumentId?: string;
    opprettetTid: string;
}
