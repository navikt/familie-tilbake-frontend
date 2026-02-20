import { feil, type FeltState, ok } from '@hooks/skjema';

import { definerteFeilmeldinger, DefinertFeilmelding, isEmpty } from './validering';

/**
 * Validering fødselsnummer
 */
const beregnKontrollsiffer = (fodselsnummer: string, multiplikatorTabell: number[]): number => {
    let sum = 0;
    for (let i = 0; i < multiplikatorTabell.length; i++) {
        sum += parseInt(fodselsnummer[i], 10) * multiplikatorTabell[i];
    }
    const rest = sum % 11;

    if (rest === 0) return 0;
    return 11 - rest;
};

const beregnKontrollsiffer1 = (fodselsnummer: string): number => {
    const kontrollSiffer1Multiplikatorer = [3, 7, 6, 1, 8, 9, 4, 5, 2];
    return beregnKontrollsiffer(fodselsnummer, kontrollSiffer1Multiplikatorer);
};

const beregnKontrollsiffer2 = (fodselsnummer: string): number => {
    const kontrollSiffer2Multiplikatorer = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    return beregnKontrollsiffer(fodselsnummer, kontrollSiffer2Multiplikatorer);
};

const validerFødselsnumer = (fnr: string): boolean => {
    if (fnr.length !== 11) {
        return false;
    }
    return (
        parseInt(fnr[9], 10) === beregnKontrollsiffer1(fnr) &&
        parseInt(fnr[10], 10) === beregnKontrollsiffer2(fnr)
    );
};

export const validerFødselsnummerFelt = (felt: FeltState<string | ''>): FeltState<string> => {
    if (isEmpty(felt.verdi))
        return feil(felt, definerteFeilmeldinger[DefinertFeilmelding.ObligatoriskFelt]);
    return validerFødselsnumer(felt.verdi) ? ok(felt) : feil(felt, 'Ugyldig fødselsnummer');
};
