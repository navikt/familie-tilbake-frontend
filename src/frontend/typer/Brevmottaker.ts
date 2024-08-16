import { Vergetype } from '../kodeverk/verge';

export enum MottakerType {
    BRUKER_MED_UTENLANDSK_ADRESSE = 'BRUKER_MED_UTENLANDSK_ADRESSE',
    FULLMEKTIG = 'FULLMEKTIG',
    VERGE = 'VERGE',
    DØDSBO = 'DØDSBO',
    BRUKER = 'BRUKER',
}

interface ManuellAdresseInfo {
    adresselinje1: string;
    adresselinje2?: string;
    postnummer: string;
    poststed: string;
    landkode: string;
}
export interface IBrevmottaker {
    navn: string;
    personIdent?: string;
    organisasjonsnummer?: string;
    type: MottakerType;
    vergetype?: Vergetype;
    manuellAdresseInfo?: ManuellAdresseInfo;
}

export const mottakerTypeVisningsnavn: Record<MottakerType, string> = {
    BRUKER_MED_UTENLANDSK_ADRESSE: 'Bruker med utenlandsk adresse',
    FULLMEKTIG: 'Fullmektig',
    VERGE: 'Verge',
    DØDSBO: 'Dødsbo',
    BRUKER: 'Bruker',
};

export enum AdresseKilde {
    MANUELL_REGISTRERING = 'MANUELL_REGISTRERING',
    OPPSLAG_REGISTER = 'OPPSLAG_REGISTER',
    OPPSLAG_ORGANISASJONSREGISTER = 'OPPSLAG_ORGANISASJONSREGISTER',
    UDEFINERT = 'UDEFINERT',
}

export const adresseKilder: Record<AdresseKilde, string> = {
    MANUELL_REGISTRERING: 'Manuell registrering',
    OPPSLAG_REGISTER: 'Oppslag i personregister',
    OPPSLAG_ORGANISASJONSREGISTER: 'Oppslag i organisasjonsregister',
    UDEFINERT: 'Udefinert',
};
