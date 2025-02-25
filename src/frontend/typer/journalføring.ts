export interface IJournalpost {
    avsenderMottaker?: AvsenderMottaker;
    datoMottatt?: string;
    journalpostId: string;
    journalposttype: Journalposttype;
    journalstatus: Journalstatus;
    tema?: string;
    behandlingstema?: string;
    sak?: IJournalpostSak;
    bruker?: IJournalpostBruker;
    journalforendeEnhet?: string;
    kanal?: string;
    dokumenter?: IDokumentInfo[];
    tittel?: string;
    relevanteDatoer: IJournalpostRelevantDato[];
    utsendingsinfo?: Utsendingsinfo;
}

export interface AvsenderMottaker {
    erLikBruker: boolean;
    id: string;
    land: string;
    navn: string;
    type: AvsenderMottakerIdType;
}

export enum AvsenderMottakerIdType {
    FNR = 'FNR',
    HPRNR = 'HPRNR',
    ORGNR = 'ORGNR',
    UKJENT = 'UKJENT',
    UTL_ORG = 'UTL_ORG',
}

export enum Journalposttype {
    I = 'I',
    U = 'U',
    N = 'N',
}

export enum Journalstatus {
    MOTTATT = 'MOTTATT',
    JOURNALFOERT = 'JOURNALFOERT',
    FERDIGSTILT = 'FERDIGSTILT',
    EKSPEDERT = 'EKSPEDERT',
    UNDER_ARBEID = 'UNDER_ARBEID',
    FEILREGISTRERT = 'FEILREGISTRERT',
    UTGAAR = 'UTGAAR',
    AVBRUTT = 'AVBRUTT',
    UKJENT_BRUKER = 'UKJENT_BRUKER',
    RESERVERT = 'RESERVERT',
    OPPLASTING_DOKUMENT = 'OPPLASTING_DOKUMENT',
    UKJENT = 'UKJENT',
}

export interface IJournalpostSak {
    arkivsaksnummer?: string;
    arkivsaksystem?: string;
    fagsakId?: string;
    fagsaksystem?: string;
}

export interface IJournalpostBruker {
    id: string;
}

export interface IDokumentInfo {
    tittel?: string;
    brevkode?: string;
    dokumentInfoId?: string;
    dokumentstatus?: Dokumentstatus;
    dokumentvarianter?: IDokumentvariant[];
    logiskeVedlegg: ILogiskVedlegg[];
}

export interface IJournalpostRelevantDato {
    dato: string;
    datotype: JournalpostDatotype;
}

export type Utsendingsinfo = {
    varselSendt: VarselSendt[];
    fysiskpostSendt?: FysiskpostSendt;
    digitalpostSendt?: DigitalpostSendt;
};

export enum Dokumentstatus {
    FERDIGSTILT = 'FERDIGSTILT',
    AVBRUTT = 'AVBRUTT',
    UNDER_REDIGERING = 'UNDER_REDIGERING',
    KASSERT = 'KASSERT',
}

export interface IDokumentvariant {
    variantformat: string;
}

export interface ILogiskVedlegg {
    logiskVedleggId: string;
    tittel: string;
}

export enum JournalpostDatotype {
    DATO_SENDT_PRINT = 'DATO_SENDT_PRINT',
    DATO_EKSPEDERT = 'DATO_EKSPEDERT',
    DATO_JOURNALFOERT = 'DATO_JOURNALFOERT',
    DATO_REGISTRERT = 'DATO_REGISTRERT',
    DATO_AVS_RETUR = 'DATO_AVS_RETUR',
    DATO_DOKUMENT = 'DATO_DOKUMENT',
}

type VarselSendt = {
    type: 'EPOST' | 'SMS';
    varslingstidspunkt?: string;
};

type FysiskpostSendt = {
    adressetekstKonvolutt: string;
};

type DigitalpostSendt = {
    adresse: string;
};
