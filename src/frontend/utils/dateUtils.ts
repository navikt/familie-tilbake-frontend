import { parseISO, differenceInCalendarYears, add, differenceInBusinessDays } from 'date-fns';

const datoformat = { day: '2-digit', month: '2-digit', year: 'numeric' };

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

export const finnDatoRelativtTilNå = (config: Duration): string => {
    const now = new Date();
    const aDate = add(now, config);
    return formatterDato(aDate);
};

const formatterPeriodelengde = (weeks?: number, days?: number): string => {
    if (weeks === undefined && days === undefined) {
        return 'Antall uker og dager -';
    }

    if (days === 0) {
        return weeks === 1 ? `${weeks} uke` : `${weeks} uker`;
    }

    if (weeks === 0) {
        return days === 1 ? `${days} dag` : `${days} dager`;
    }

    if (days === 1) {
        return weeks === 1 ? `${weeks} uke ${days} dag` : `${weeks} uker ${days} dag`;
    }

    if (weeks === 1) {
        return `${weeks} uke ${days} dag`;
    }

    return `${weeks} uker ${days} dager`;
};

export const hentPeriodelengde = (fraDatoPeriode: string, tilDatoPeriode: string): string => {
    const numOfDays = -differenceInBusinessDays(new Date(fraDatoPeriode), new Date(tilDatoPeriode));

    const weeks = Math.floor(numOfDays / 5);
    const days = numOfDays % 5;

    return formatterPeriodelengde(weeks, days);
};
