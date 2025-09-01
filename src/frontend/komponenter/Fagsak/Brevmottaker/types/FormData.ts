interface GrunnleggendeAdresseFelter {
    navn: string;
    land: string;
    adresselinje1: string;
    adresselinje2: string;
    postnummer: string;
    poststed: string;
}

interface UtvideteAdresseFelter extends GrunnleggendeAdresseFelter {
    adresseKilde: string;
    personnummer: string;
    organisasjonsnummer: string;
}

export interface FormData {
    mottakerType: string;
    brukerMedUtenlandskAdresse?: GrunnleggendeAdresseFelter;
    fullmektig?: UtvideteAdresseFelter;
    verge?: UtvideteAdresseFelter & {
        vergetype: string;
    };
    dødsbo?: GrunnleggendeAdresseFelter;
}

export type { GrunnleggendeAdresseFelter, UtvideteAdresseFelter };
