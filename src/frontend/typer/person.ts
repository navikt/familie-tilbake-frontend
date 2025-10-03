export enum Kjønn {
    Kvinne = 'KVINNE',
    Mann = 'MANN',
    Ukjent = 'UKJENT',
}

export type Person = {
    personIdent: string;
    navn: string;
    fødselsdato: string;
    kjønn: Kjønn;
    dødsdato?: string;
};
