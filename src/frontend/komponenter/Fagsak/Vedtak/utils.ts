import type { Element } from '../../../generated-new';

import { datoTilTekst } from '../../../utils';

export const elementArrayTilTekst = (elementer: Element[]): string => {
    return elementer.map(e => e.tekst).join('\n\n');
};

export const tekstTilElementArray = (tekst: string): Element[] => {
    return tekst
        .split(/\n\n+/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => ({ type: 'rentekst' as const, tekst: t }));
};

export const formaterPeriodeTittel = (fom: string, tom: string): string => {
    const fomDato = datoTilTekst(fom);
    const tomDato = datoTilTekst(tom);
    return `${fomDato}–${tomDato}`;
};
