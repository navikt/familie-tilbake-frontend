import type { RotElement } from '~/generated-new';

export const elementArrayTilTekst = (elementer: RotElement[]): string => {
    return elementer
        .filter(e => e.type === 'rentekst')
        .map(e => (e.type === 'rentekst' ? e.tekst : undefined))
        .join('\n\n');
};

export const tekstTilElementArray = (tekst: string): RotElement[] => {
    return tekst
        .split(/\n\n+/)
        .filter(t => t.length > 0)
        .map(t => ({ type: 'rentekst' as const, tekst: t }));
};
