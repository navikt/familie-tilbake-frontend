import type { Element } from '../../../generated-new';

import { format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';

export const elementArrayTilTekst = (elementer: Element[]): string => {
    return elementer.map(e => e.tekst).join('\n\n');
};

export const tekstTilElementArray = (tekst: string): Element[] => {
    return tekst
        .split(/\n\n+/)
        .filter(t => t.trim().length > 0)
        .map(t => ({ type: 'rentekst' as const, tekst: t }));
};

export const formaterPeriodeTittel = (fom: string, tom: string): string => {
    const fomDato = format(parseISO(fom), 'd. MMMM yyyy', { locale: nb });
    const tomDato = format(parseISO(tom), 'd. MMMM yyyy', { locale: nb });
    return `${fomDato}–${tomDato}`;
};
