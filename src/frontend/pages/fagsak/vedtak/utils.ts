import type { Element } from '@generated-new';

export const elementArrayTilTekst = (elementer: Element[]): string => {
    return elementer.map(e => e.tekst).join('\n\n');
};

export const tekstTilElementArray = (tekst: string): Element[] => {
    return tekst
        .split(/\n\n+/)
        .filter(t => t.length > 0)
        .map(t => ({ type: 'rentekst' as const, tekst: t }));
};
