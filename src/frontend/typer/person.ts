import { kjønnType } from '@navikt/familie-typer';

import type { Målform } from './fagsak';
export interface IPerson {
    personIdent: string;
    navn: string;
    fødselsdato: string;
    kjønn: kjønnType;
    dødsdato?: string;
}

export interface IGrunnlagPerson {
    fødselsdato: string;
    kjønn: kjønnType;
    navn: string;
    personIdent: string;
    registerhistorikk?: IRestRegisterhistorikk;
    type: PersonType;
    målform: Målform;
    dødsfallDato?: string;
}

export interface IRestRegisterhistorikk {
    hentetTidspunkt: string;
    sivilstand: IRestRegisteropplysning[];
    oppholdstillatelse: IRestRegisteropplysning[];
    statsborgerskap: IRestRegisteropplysning[];
    bostedsadresse: IRestRegisteropplysning[];
    dødsboadresse: IRestRegisteropplysning[];
}

export interface IRestRegisteropplysning {
    fom?: string;
    tom?: string;
    verdi: string;
}

export enum PersonType {
    SØKER = 'SØKER',
    ANNENPART = 'ANNENPART',
    BARN = 'BARN',
}
