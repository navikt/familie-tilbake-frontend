export enum Kjønn {
    Kvinne = 'KVINNE',
    Mann = 'MANN',
    Ukjent = 'UKJENT',
}

export interface IPerson {
    personIdent: string;
    navn: string;
    fødselsdato: string;
    kjønn: Kjønn;
    dødsdato?: string;
}
