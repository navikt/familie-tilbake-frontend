import type { IPerson } from '../typer/person';
import { differenceInMilliseconds } from 'date-fns';
import { dagensDato, isoStringTilDate } from './dato';

export const millisekunderIEttÅr = 3.15576e10;

export const hentAlder = (fødselsdato: string): number => {
    return fødselsdato !== ''
        ? Math.floor(
              differenceInMilliseconds(dagensDato, isoStringTilDate(fødselsdato)) /
                  millisekunderIEttÅr
          )
        : 0;
};

export const kunSiffer = (value: string) => /^\d+$/.test(value);

const erPersonId = (personIdent: string) => {
    const id = personIdent.split(' ').join('');
    return /^[+-]?\d+(\.\d+)?$/.test(id) && id.length === 11;
};

export const erOrgNr = (orgNr: string) => {
    // Sjekker kun etter ni siffer, validerer ikke kontrollsifferet (det 9. sifferet)
    return kunSiffer(orgNr) && orgNr.length === 9;
};

export const formaterIdent = (personIdent: string, ukjentTekst = 'Ukjent id') => {
    if (personIdent === '') {
        return ukjentTekst;
    }

    return erPersonId(personIdent)
        ? `${personIdent.slice(0, 6)} ${personIdent.slice(6, personIdent.length)}`
        : erOrgNr(personIdent)
          ? `${personIdent.slice(0, 3)} ${personIdent.slice(3, 6)} ${personIdent.slice(6, 9)}`
          : ukjentTekst;
};

export const formaterNavnAlderOgIdent = (person: {
    personIdent: string;
    navn: string;
    fødselsdato: string;
}): string => {
    return `${person.navn} (${hentAlder(person.fødselsdato)} år) ${formaterIdent(
        person.personIdent
    )}`;
};

export const lagPersonLabel = (ident: string, bruker: IPerson): string => {
    if (bruker) {
        return formaterNavnAlderOgIdent({ ...bruker });
    } else {
        return ident;
    }
};
