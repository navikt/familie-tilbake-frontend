import { format, isValid, parseISO, startOfToday } from 'date-fns';

export type IsoDatoString = string; // Format YYYY-MM-DD (ISO)

export const dagensDato = startOfToday();

export enum Datoformat {
    Dato = 'dd.MM.yyyy',
    IsoDag = 'yyyy-MM-dd',
}

type DateTilFormatertStringProps = {
    date?: Date;
    tilFormat: Datoformat;
    defaultString?: string;
};

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

/** Får inn f.eks. 2026-02-27T12:34:56Z som gir 27.02.2026 kl. 12:34 */
export const fraIsoStringTilDatoOgKlokkeslett = (isoDatoString: IsoDatoString): string => {
    const dato = isoStringTilDate(isoDatoString);
    return format(dato, "dd.MM.yyyy 'kl'. HH:mm");
};
