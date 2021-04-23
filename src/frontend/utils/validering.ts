import { feil, FeltState, ok } from '@navikt/familie-skjema';

import { isNumeric } from './miscUtils';

const textRegex = /^[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'\-/\n%§!?@_()+:;,="&\n]*$/;
const textGyldigRegex = /[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'\-/\n%§!?@_()+:;,="&\n]*/g;

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

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const erFeltetEmpty = (felt: FeltState<any>) => {
    return !isEmpty(felt.verdi)
        ? ok(felt)
        : feil(felt, definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT]);
};

export const validerTekstFelt = (felt: FeltState<string | ''>) => {
    if (felt.verdi !== '') {
        const feilmelding = hasValidText(felt.verdi);
        return !feilmelding ? ok(felt) : feil(felt, feilmelding);
    } else {
        return feil(felt, definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT]);
    }
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
        console.log('verdien skulle vært ugyldig?!');
        return feil(felt, invalidMinValue(minVerdi));
    }

    return ok(felt);
};
