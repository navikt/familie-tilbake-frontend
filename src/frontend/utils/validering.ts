import { isValid, parseISO } from 'date-fns';

import { feil, type FeltState, ok } from '@navikt/familie-skjema';

import { isNumeric } from './miscUtils';

const textRegex =
    /^[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'‐—–\-/\n%§!?#@_()+:;,="&\n]*$/;
const textGyldigRegex =
    /[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'‐—–\-/\n%§!?#@_()+:;,="&\n]*/g;

export enum DEFINERT_FEILMELDING {
    OBLIGATORISK_FELT = 'OBLIGATORISK_FELT',
}

export const definerteFeilmeldinger: Record<DEFINERT_FEILMELDING, string> = {
    OBLIGATORISK_FELT: 'Feltet må fylles ut',
};

const invalidTextMessage = (text: string): string => `Feltet inneholder ugyldige tegn: ${text}`;
const invalidValueMessage = (text: string): string => `Feltet inneholder en ugyldig verdi: ${text}`;
const invalidMaxValue = (verdi: number): string => `Feltet må være mindre eller lik ${verdi}`;
const invalidMinValue = (verdi: number): string => `Feltet må være større eller lik ${verdi}`;

export const isEmpty = (text?: string | number | boolean | Date | null) =>
    text === null || text === undefined || text.toString().trim().length === 0;

type ValideringsResultat = string | null | undefined;

export const hasValidText = (text: string): ValideringsResultat => {
    if (!textRegex.test(text)) {
        const illegalChars = text.replace(textGyldigRegex, '');
        return invalidTextMessage(illegalChars.replace(/[\t]/g, 'Tabulatortegn'));
    }
    return null;
};

const _validerMaxLength =
    (length: number) =>
    // eslint-disable-next-line
    (text: string | undefined): ValideringsResultat => {
        // @ts-ignore
        return isEmpty(text) || text.toString().trim().length <= length
            ? null
            : `Du kan skrive maksimalt ${length} tegn`;
    };

const _validerMinLength =
    (length: number) =>
    // eslint-disable-next-line
    (text: string | undefined): ValideringsResultat => {
        // @ts-ignore
        return isEmpty(text) || text.toString().trim().length >= length
            ? null
            : `Du må skrive minst ${length} tegn`;
    };

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const erFeltetEmpty = (felt: FeltState<any>) => {
    return !isEmpty(felt.verdi)
        ? ok(felt)
        : feil(felt, definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT]);
};

const _minLength3 = _validerMinLength(3);
const _maxLength1500 = _validerMaxLength(1500);

const _validerTekst = (
    maxLength: (v: string) => ValideringsResultat,
    minLength: (v: string) => ValideringsResultat,
    verdi: string
) => {
    if (isEmpty(verdi)) {
        return definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT];
    }
    let feilmelding = hasValidText(verdi);
    feilmelding = feilmelding || maxLength(verdi);
    feilmelding = feilmelding || minLength(verdi);
    return feilmelding;
};

export const validerTekstMaksLengde = (maxLengde: number) => (verdi: string) => {
    return _validerTekst(_validerMaxLength(maxLengde), _minLength3, verdi);
};

export const validerTekst = (verdi: string): ValideringsResultat => {
    return _validerTekst(_maxLength1500, _minLength3, verdi);
};

export const validerTekstFelt = (felt: FeltState<string | ''>) => {
    const feilmelding = validerTekst(felt.verdi);
    return !feilmelding ? ok(felt) : feil(felt, feilmelding);
};

export const validerTekstFeltMaksLengde = (maxLengde: number, felt: FeltState<string | ''>) => {
    const feilmelding = validerTekstMaksLengde(maxLengde)(felt.verdi);
    return !feilmelding ? ok(felt) : feil(felt, feilmelding);
};

export const validerNummerFelt = (
    felt: FeltState<string | ''>,
    maxVerdi?: number,
    minVerdi?: number
) => {
    if (isEmpty(felt.verdi))
        return feil(felt, definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT]);
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
        return definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT];
    }
    const lestDato = parseISO(dato);
    return isValid(lestDato) ? undefined : 'Ugyldig dato';
};

export const validerDatoFelt = (felt: FeltState<string | ''>) => {
    const feilmelding = validerDato(felt.verdi);
    return !feilmelding ? ok(felt) : feil(felt, feilmelding);
};
