import { parseISO, differenceInCalendarYears } from 'date-fns';

const datoformat = { day: '2-digit', month: '2-digit', year: 'numeric' };

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
