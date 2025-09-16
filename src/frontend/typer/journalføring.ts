export interface IJournalpost {
    avsenderMottaker?: AvsenderMottaker;
    datoMottatt?: string;
    journalpostId: string;
    journalposttype: Journalposttype;
    journalstatus: Journalstatus;
    tema?: string;
    behandlingstema?: string;
    sak?: JournalpostSak;
    bruker?: JournalpostBruker;
    journalforendeEnhet?: string;
    kanal?: string;
    dokumenter?: IDokumentInfo[];
    tittel?: string;
    relevanteDatoer: IJournalpostRelevantDato[];
    utsendingsinfo?: Utsendingsinfo;
}

type AvsenderMottaker = {
    erLikBruker: boolean;
    id: string;
    land: string;
    navn: string;
    type: AvsenderMottakerIdType;
};

enum AvsenderMottakerIdType {
    Fnr = 'FNR',
    HprNr = 'HPRNR',
    OrgNr = 'ORGNR',
    Ukjent = 'UKJENT',
    UtlOrg = 'UTL_ORG',
}

export enum Journalposttype {
    I = 'I',
    U = 'U',
    N = 'N',
}

enum Journalstatus {
    Mottatt = 'MOTTATT',
    Journalfoert = 'JOURNALFOERT',
    Ferdigstilt = 'FERDIGSTILT',
    Ekspedert = 'EKSPEDERT',
    UnderArbeid = 'UNDER_ARBEID',
    Feilregistrert = 'FEILREGISTRERT',
    Utgaar = 'UTGAAR',
    Avbrutt = 'AVBRUTT',
    UkjentBruker = 'UKJENT_BRUKER',
    Reservert = 'RESERVERT',
    OpplastingDokument = 'OPPLASTING_DOKUMENT',
    Ukjent = 'UKJENT',
}

type JournalpostSak = {
    arkivsaksnummer?: string;
    arkivsaksystem?: string;
    fagsakId?: string;
    fagsaksystem?: string;
};

type JournalpostBruker = {
    id: string;
};

export interface IDokumentInfo {
    tittel?: string;
    brevkode?: string;
    dokumentInfoId?: string;
    dokumentstatus?: Dokumentstatus;
    dokumentvarianter?: Dokumentvariant[];
    logiskeVedlegg: LogiskVedlegg[];
}

export interface IJournalpostRelevantDato {
    dato: string;
    datotype: JournalpostDatotype;
}

type Utsendingsinfo = {
    varselSendt: VarselSendt[];
    fysiskpostSendt?: FysiskpostSendt;
    digitalpostSendt?: DigitalpostSendt;
};

enum Dokumentstatus {
    Ferdigstilt = 'FERDIGSTILT',
    Avbrutt = 'AVBRUTT',
    UnderRedigering = 'UNDER_REDIGERING',
    Kassert = 'KASSERT',
}

type Dokumentvariant = {
    variantformat: string;
};

type LogiskVedlegg = {
    logiskVedleggId: string;
    tittel: string;
};

export enum JournalpostDatotype {
    DatoSendtPrint = 'DATO_SENDT_PRINT',
    DatoEksedert = 'DATO_EKSPEDERT',
    DatoJournalfoert = 'DATO_JOURNALFOERT',
    DatoRegistrert = 'DATO_REGISTRERT',
    DatoAvsRetur = 'DATO_AVS_RETUR',
    DatoDokument = 'DATO_DOKUMENT',
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
