export enum Aktør {
    Saksbehandler = 'SAKSBEHANDLER',
    Beslutter = 'BESLUTTER',
    Vedtaksløsning = 'VEDTAKSLØSNING',
}

export const aktører: Record<Aktør, string> = {
    [Aktør.Saksbehandler]: 'Saksbehandler',
    [Aktør.Beslutter]: 'Beslutter',
    [Aktør.Vedtaksløsning]: 'Vedtaksløsningen',
};

export enum Historikkinnslagstype {
    Hendelse = 'HENDELSE',
    Skjermlenke = 'SKJERMLENKE',
    Brev = 'BREV',
}

export interface IHistorikkInnslag {
    behandlingId?: string;
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
