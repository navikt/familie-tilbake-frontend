import { kjønnType } from '@navikt/familie-typer';

export interface IPerson {
    personIdent: string;
    navn: string;
    fødselsdato: string;
    kjønn: kjønnType;
    dødsdato?: string;
}
