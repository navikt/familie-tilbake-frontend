import {
    parseISO,
    differenceInCalendarYears,
    add,
    differenceInMonths,
    isBefore,
    endOfMonth,
    endOfDay,
} from 'date-fns';

import { isEmpty } from './validering';

const datoformat: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
};

export enum datoformatNorsk {
    DATO = 'ddmmåå',
}

export const formatterDato = (dato: Date) => dato.toLocaleDateString('no-NO', datoformat);

export const formatterDatostring = (datoAsString: string) => {
    const dato = parseISO(datoAsString);
    return dato.toLocaleDateString('no-NO', datoformat);
};

export const hentAlder = (fødselsdato: string) => {
    const now = new Date();
    const dato = parseISO(fødselsdato);
    return differenceInCalendarYears(now, dato);
};

export const finnDateRelativtTilNå = (config: Duration): Date => {
    const now = new Date();
    const aDate = add(now, config);
    return aDate;
};

export const finnDatoRelativtTilNå = (config: Duration): string => {
    const aDate = finnDateRelativtTilNå(config);
    return formatterDato(aDate);
};

const formatterPeriodelengde = (years?: number, months?: number): string => {
    if (years === undefined && months === undefined) {
        return 'Antall år og måneder -';
    }

    if (months === 0) {
        return `${years} år`;
    }

    if (years === 0) {
        return months === 1 ? `${months} måned` : `${months} måneder`;
    }

    if (months === 1) {
        return `${years} år ${months} måned`;
    }

    return `${years} år ${months} måneder`;
};

export const hentPeriodelengde = (fraDatoPeriode: string, tilDatoPeriode: string): string => {
    const numOfMonths = differenceInMonths(new Date(tilDatoPeriode), new Date(fraDatoPeriode)) + 1;

    const years = Math.floor(numOfMonths / 12);
    const months = numOfMonths % 12;

    return formatterPeriodelengde(years, months);
};

const yesterday = (): Date => {
    return finnDateRelativtTilNå({ days: -1 });
};

const dateBeforeOrEqual = (latest: Date, dato: Date): boolean => isBefore(latest, dato);

const datoBeforeOrEqual = (latest: Date, dato: string): boolean =>
    isEmpty(dato) || dateBeforeOrEqual(parseISO(dato), latest);

export const dateBeforeToday = (dato: string): boolean => datoBeforeOrEqual(yesterday(), dato);

const getEndOfMonth = (dato: string): Date => {
    return endOfMonth(parseISO(dato));
};

export const getEndOfMonthISODateStr = (dato?: string): string | null => {
    if (!dato || isEmpty(dato)) return null;
    const endOfMonth = getEndOfMonth(dato);
    return endOfMonth.toISOString().substring(0, 10);
};

export const flyttDatoISODateStr = (dato: string, config: Duration): string => {
    const aDate = endOfDay(parseISO(dato));
    const newDate = add(aDate, config);
    return newDate.toISOString().substring(0, 10);
};
