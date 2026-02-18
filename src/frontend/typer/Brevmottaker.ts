import type { Vergetype } from '@kodeverk/verge';

export enum MottakerType {
    BrukerMedUtenlandskAdresse = 'BRUKER_MED_UTENLANDSK_ADRESSE',
    Fullmektig = 'FULLMEKTIG',
    Verge = 'VERGE',
    Dødsbo = 'DØDSBO',
    Bruker = 'BRUKER',
}

type ManuellAdresseInfo = {
    adresselinje1: string;
    adresselinje2?: string;
    postnummer: string;
    poststed: string;
    landkode: string;
};
export type Brevmottaker = {
    navn: string;
    personIdent?: string;
    organisasjonsnummer?: string;
    type: MottakerType;
    vergetype?: Vergetype;
    manuellAdresseInfo?: ManuellAdresseInfo;
};

export const mottakerTypeVisningsnavn: Record<MottakerType, string> = {
    BRUKER_MED_UTENLANDSK_ADRESSE: 'Bruker med utenlandsk adresse',
    FULLMEKTIG: 'Fullmektig',
    VERGE: 'Verge',
    DØDSBO: 'Dødsbo',
    BRUKER: 'Bruker',
};

export enum AdresseKilde {
    ManuellRegistrering = 'MANUELL_REGISTRERING',
    OppslagRegister = 'OPPSLAG_REGISTER',
    OppslagOrganisasjonsregister = 'OPPSLAG_ORGANISASJONSREGISTER',
    Udefinert = 'UDEFINERT',
}

export const adresseKilder: Record<AdresseKilde, string> = {
    [AdresseKilde.ManuellRegistrering]: 'Manuell registrering',
    [AdresseKilde.OppslagRegister]: 'Oppslag i personregister',
    [AdresseKilde.OppslagOrganisasjonsregister]: 'Oppslag i organisasjonsregister',
    [AdresseKilde.Udefinert]: 'Udefinert',
};
