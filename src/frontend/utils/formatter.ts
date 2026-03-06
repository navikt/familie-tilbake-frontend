import type { FrontendBrukerDto } from '~/generated';

import { hentAlder } from './dateUtils';

const kunSiffer = (value: string): boolean => /^\d+$/.test(value);

const erPersonId = (personIdent: string): boolean => {
    const id = personIdent.split(' ').join('');
    return /^[+-]?\d+(\.\d+)?$/.test(id) && id.length === 11;
};

const erOrgNr = (orgNr: string): boolean => {
    // Sjekker kun etter ni siffer, validerer ikke kontrollsifferet (det 9. sifferet)
    return kunSiffer(orgNr) && orgNr.length === 9;
};

export const formaterIdent = (personIdent: string, ukjentTekst = 'Ukjent id'): string => {
    if (personIdent === '') {
        return ukjentTekst;
    }

    return erPersonId(personIdent)
        ? `${personIdent.slice(0, 6)} ${personIdent.slice(6, personIdent.length)}`
        : erOrgNr(personIdent)
          ? `${personIdent.slice(0, 3)} ${personIdent.slice(3, 6)} ${personIdent.slice(6, 9)}`
          : ukjentTekst;
};

export const lagPersonLabel = (ident: string, bruker: FrontendBrukerDto): string => {
    if (bruker && bruker.fødselsdato) {
        return `${bruker.navn} (${hentAlder(bruker.fødselsdato, bruker.dødsdato)} år) ${formaterIdent(
            bruker.personIdent
        )}`;
    } else {
        return ident;
    }
};
