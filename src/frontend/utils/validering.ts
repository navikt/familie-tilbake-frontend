const textRegex = /^[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'\-/\n%§!?@_()+:;,="&\n]*$/;
const textGyldigRegex = /[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'\-/\n%§!?@_()+:;,="&\n]*/g;

export enum DEFINERT_FEILMELDING {
    OBLIGATORISK_FELT = 'OBLIGATORISK_FELT',
}

export const definerteFeilmeldinger: Record<DEFINERT_FEILMELDING, string> = {
    OBLIGATORISK_FELT: 'Feltet må fylles ut',
};

const invalidTextMessage = (text: string): string => `Feltet inneholder ugyldige tegn: ${text}`;

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
