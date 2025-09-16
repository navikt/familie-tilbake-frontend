import { format, isValid, parseISO, startOfToday } from 'date-fns';

export type IsoDatoString = string; // Format YYYY-MM-DD (ISO)

export const dagensDato = startOfToday();

export enum Datoformat {
    Dato = 'dd.MM.yyyy',
    IsoDag = 'yyyy-MM-dd',
}

interface DateTilFormatertStringProps {
    date?: Date;
    tilFormat: Datoformat;
    defaultString?: string;
}

const dateTilFormatertString = ({
    date,
    tilFormat,
    defaultString = '',
}: DateTilFormatertStringProps): string => {
    return date && isValid(date) ? format(date, tilFormat) : defaultString;
};

export const dateTilIsoDatoString = (dato?: Date): IsoDatoString =>
    dateTilFormatertString({ date: dato, tilFormat: Datoformat.IsoDag, defaultString: '' });

export const dateTilIsoDatoStringEllerUndefined = (dato?: Date): IsoDatoString | undefined =>
    dato && isValid(dato) ? format(dato, Datoformat.IsoDag) : undefined;

export const isoStringTilDate = (isoDatoString: IsoDatoString): Date => {
    const dato = parseISO(isoDatoString);

    if (!isValid(dato)) {
        throw new Error(`Dato '${isoDatoString}' er ugyldig`);
    }

    return dato;
};
