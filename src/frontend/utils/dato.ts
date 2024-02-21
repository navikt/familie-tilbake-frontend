import { format, isValid, parseISO, startOfToday } from 'date-fns';

export type IsoDatoString = string; // Format YYYY-MM-DD (ISO)

export const dagensDato = startOfToday();

export enum Datoformat {
    DATO = 'dd.MM.yyyy',
    ISO_DAG = 'yyyy-MM-dd',
}

export const dateTilIsoDatoStringEllerUndefined = (dato?: Date): IsoDatoString | undefined =>
    dato && isValid(dato) ? format(dato, Datoformat.ISO_DAG) : undefined;

export const isoStringTilDate = (isoDatoString: IsoDatoString): Date => {
    const dato = parseISO(isoDatoString);

    if (!isValid(dato)) {
        throw new Error(`Dato '${isoDatoString}' er ugyldig`);
    }

    return dato;
};
