import { feil, type FeltState, ok } from '@hooks/skjema';
import { isValid, parseISO } from 'date-fns';

import { isNumeric } from './miscUtils';

const textRegex =
    /^[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'‐—–\-/\n%§!?#@_()«»+:;,="&\n\u00A0]*$/;
const textGyldigRegex =
    /[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'‐—–\-/\n%§!?#@_()«»+:;,="&\n\u00A0]*/g;

export enum DefinertFeilmelding {
    ObligatoriskFelt = 'OBLIGATORISK_FELT',
}

export const definerteFeilmeldinger: Record<DefinertFeilmelding, string> = {
    [DefinertFeilmelding.ObligatoriskFelt]: 'Feltet må fylles ut',
};

const invalidTextMessage = (text: string): string => `Feltet inneholder ugyldige tegn: ${text}`;
const invalidValueMessage = (text: string): string => `Feltet inneholder en ugyldig verdi: ${text}`;
const invalidMaxValue = (verdi: number): string => `Feltet må være mindre eller lik ${verdi}`;
const invalidMinValue = (verdi: number): string => `Feltet må være større eller lik ${verdi}`;

export const isEmpty = (text?: Date | boolean | number | string | null): boolean =>
    text === null || text === undefined || text.toString().trim().length === 0;

type ValideringsResultat = string | null | undefined;

const hasValidText = (text: string): ValideringsResultat => {
    if (!textRegex.test(text)) {
        const illegalChars = text.replace(textGyldigRegex, '');
        return invalidTextMessage(illegalChars.replace(/[\t]/g, 'Tabulatortegn'));
    }
    return null;
};

const _validerMaxLength =
    (length: number) =>
    (text: string | undefined): ValideringsResultat => {
        return isEmpty(text) || (text !== undefined && text.toString().trim().length <= length)
            ? null
            : `Du kan skrive maksimalt ${length} tegn`;
    };

const _validerMinLength =
    (length: number) =>
    (text: string | undefined): ValideringsResultat => {
        return isEmpty(text) || (text !== undefined && text.toString().trim().length >= length)
            ? null
            : `Du må skrive minst ${length} tegn`;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const erFeltetEmpty = (felt: FeltState<any>): FeltState<any> => {
    return !isEmpty(felt.verdi)
        ? ok(felt)
        : feil(felt, definerteFeilmeldinger[DefinertFeilmelding.ObligatoriskFelt]);
};

const _minLength3 = _validerMinLength(3);
const _maxLength1500 = _validerMaxLength(1500);

const _validerTekst = (
    maxLength: (v: string) => ValideringsResultat,
    minLength: (v: string) => ValideringsResultat,
    verdi: string
): ValideringsResultat => {
    if (isEmpty(verdi)) {
        return definerteFeilmeldinger[DefinertFeilmelding.ObligatoriskFelt];
    }
    let feilmelding = hasValidText(verdi);
    feilmelding = feilmelding || maxLength(verdi);
    feilmelding = feilmelding || minLength(verdi);
    return feilmelding;
};

export const validerTekstMaksLengde =
    (maxLengde: number) =>
    (verdi: string): ValideringsResultat => {
        return _validerTekst(_validerMaxLength(maxLengde), _minLength3, verdi);
    };

const validerTekst = (verdi: string): ValideringsResultat => {
    return _validerTekst(_maxLength1500, _minLength3, verdi);
};

export const validerTekstFelt = (felt: FeltState<string | ''>): FeltState<string> => {
    const feilmelding = validerTekst(felt.verdi);
    return !feilmelding ? ok(felt) : feil(felt, feilmelding);
};

export const validerTekstFeltMaksLengde = (
    maxLengde: number,
    felt: FeltState<string | ''>
): FeltState<string> => {
    const feilmelding = validerTekstMaksLengde(maxLengde)(felt.verdi);
    return !feilmelding ? ok(felt) : feil(felt, feilmelding);
};

export const validerNummerFelt = (
    felt: FeltState<string | ''>,
    maxVerdi?: number,
    minVerdi?: number
): FeltState<string> => {
    if (isEmpty(felt.verdi))
        return feil(felt, definerteFeilmeldinger[DefinertFeilmelding.ObligatoriskFelt]);
    if (!isNumeric(felt.verdi)) return feil(felt, invalidValueMessage(felt.verdi));
    if (maxVerdi && maxVerdi < Number(Math.round(parseFloat(felt.verdi))))
        return feil(felt, invalidMaxValue(maxVerdi));
    if ((minVerdi || minVerdi === 0) && Number(Math.round(parseFloat(felt.verdi))) < minVerdi) {
        console.log(`verdien skulle vært ugyldig?!, min: ${minVerdi}, verdi: ${felt.verdi}`);
        return feil(felt, invalidMinValue(minVerdi));
    }

    return ok(felt);
};

export const validerDato = (dato?: string): ValideringsResultat => {
    if (!dato || isEmpty(dato)) {
        return definerteFeilmeldinger[DefinertFeilmelding.ObligatoriskFelt];
    }
    const lestDato = parseISO(dato);
    return isValid(lestDato) ? undefined : 'Ugyldig dato';
};

export const validerGyldigDato = (
    felt: FeltState<Date | undefined>
): FeltState<Date | undefined> =>
    felt.verdi && isValid(felt.verdi) ? ok(felt) : feil(felt, 'Du må velge en gyldig dato');

export const harVerdi = (str: string | null | undefined): boolean =>
    str !== undefined && str !== '' && str !== null;
