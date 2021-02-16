import { parseISO, differenceInCalendarYears, add } from 'date-fns';
import { differenceInMonths } from 'date-fns/esm';

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
