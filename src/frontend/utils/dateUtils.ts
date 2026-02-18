import type { JournalpostRelevantDato } from '@typer/journalføring';
import type { FaktaPeriode } from '@typer/tilbakekrevingstyper';
import type { Duration } from 'date-fns';

import { JournalpostDatotype } from '@typer/journalføring';
import {
    add,
    differenceInCalendarYears,
    differenceInDays,
    differenceInMilliseconds,
    differenceInMonths,
    differenceInWeeks,
    endOfDay,
    endOfMonth,
    format,
    isBefore,
    parseISO,
} from 'date-fns';
import { nb } from 'date-fns/locale/nb';

import { isEmpty } from './validering';

const datoformat: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
};

export const datoTilTekst = (dato: string): string => {
    return format(parseISO(dato), 'd. MMMM yyyy', { locale: nb });
};

const tidformat: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
};

const formatterDato = (dato: Date): string => dato.toLocaleDateString('no-NO', datoformat);

export const formatterDatoOgTid = (dato: Date): string =>
    `${dato.toLocaleDateString('no-NO', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    })} ${dato.toLocaleTimeString('no-NO', tidformat)}`;

export const formatterDatostring = (datoAsString: string): string => {
    const dato = parseISO(datoAsString);
    return dato.toLocaleDateString('no-NO', datoformat);
};

export const formatterDatoOgTidstring = (datoAsString: string): string => {
    const dato = parseISO(datoAsString);
    return `${dato.toLocaleDateString('no-NO', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    })} ${dato.toLocaleTimeString('no-NO', tidformat)}`;
};

export const hentAlder = (fødselsdato: string, dødsdato: string | undefined): number => {
    const dødsdatoEllerNå = dødsdato ? parseISO(dødsdato) : new Date();
    const fødselsdatoDate = parseISO(fødselsdato);
    return differenceInCalendarYears(dødsdatoEllerNå, fødselsdatoDate);
};

const finnDateRelativtTilNå = (config: Duration): Date => {
    const now = new Date();
    return add(now, config);
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

export const sorterFeilutbetaltePerioder = <T extends FaktaPeriode>(perioder: T[]): T[] => {
    return perioder.sort((a, b) =>
        differenceInMilliseconds(parseISO(a.periode.fom), parseISO(b.periode.fom))
    );
};

export const hentDatoRegistrertSendt = (
    relevanteDatoer: JournalpostRelevantDato[],
    journalposttype: string
): Date => {
    let datoRegistrert = relevanteDatoer.find(dato => {
        if (journalposttype === 'I') {
            return dato.datotype === JournalpostDatotype.DatoRegistrert;
        } else if (journalposttype === 'U') {
            return dato.datotype === JournalpostDatotype.DatoEksedert;
        } else {
            return dato.datotype === JournalpostDatotype.DatoJournalfoert;
        }
    });
    datoRegistrert =
        datoRegistrert ||
        relevanteDatoer.find(dato => dato.datotype === JournalpostDatotype.DatoJournalfoert) ||
        relevanteDatoer.find(dato => dato.datotype === JournalpostDatotype.DatoDokument);

    // @ts-expect-error Får alltid en av disse datoene
    return parseISO(datoRegistrert.dato);
};

export const formatterDatoDDMMYYYY = (dato: Date): string => {
    return format(new Date(dato), 'dd.MM.yyyy');
};

export const formatterRelativTid = (dato: string): string => {
    const target = new Date(dato);
    const now = new Date();

    const ukerSiden = differenceInWeeks(now, target);
    const dagerSiden = differenceInDays(now, target);
    const månederSiden = differenceInMonths(now, target);

    if (månederSiden >= 1 || ukerSiden >= 4) {
        const antallMåneder = Math.max(månederSiden, 1);
        return `${antallMåneder} ${antallMåneder === 1 ? 'måned' : 'måneder'} siden`;
    } else if (ukerSiden >= 1) {
        return `${ukerSiden} ${ukerSiden === 1 ? 'uke' : 'uker'} siden`;
    } else if (dagerSiden >= 1) {
        return `${dagerSiden} ${dagerSiden === 1 ? 'dag' : 'dager'} siden`;
    } else {
        return 'i dag';
    }
};
