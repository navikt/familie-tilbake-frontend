import { Vergetype } from '../kodeverk/verge';

export enum MottakerType {
    BRUKER_MED_UTENLANDSK_ADRESSE = 'BRUKER_MED_UTENLANDSK_ADRESSE',
    FULLMEKTIG = 'FULLMEKTIG',
    VERGE = 'VERGE',
    DØDSBO = 'DØDSBO',
}

export interface ManuellAdresseInfo {
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
};
