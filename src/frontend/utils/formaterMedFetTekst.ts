import type { ReactNode } from 'react';

import { createElement } from 'react';

export const formaterMedFetTekst = (tekst: string): ReactNode => {
    const tekstDeler = tekst.split(/(\*\*.*?\*\*)/);
    return tekstDeler
        .filter(del => del.length > 0)
        .map((del, index) => {
            if (del.startsWith('**') && del.endsWith('**')) {
                const fetTekst = del.slice(2, -2);
                return createElement('strong', { key: `fet-${index}-${fetTekst}` }, fetTekst);
            }
            return createElement('span', { key: `fet-${index}-${del}` }, del);
        });
};
