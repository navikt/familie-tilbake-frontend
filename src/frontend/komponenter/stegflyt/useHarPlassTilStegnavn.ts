import type { RefObject } from 'react';

import { useLayoutEffect, useRef, useState } from 'react';

type Plassmåling = {
    /** Settes på elementet som alltid fyller den tilgjengelige plassen. */
    beholderRef: RefObject<HTMLDivElement | null>;
    /** Settes på elementet som inneholder stegene. */
    innholdRef: RefObject<HTMLOListElement | null>;
    harPlass: boolean;
};

/**
 * Avgjør om det er plass til å vise alle stegnavnene ved siden av
 * navigasjonsknappene.
 *
 * Plassbehovet kan ikke uttrykkes som en fast breddeterskel, fordi det varierer
 * med antall steg, hvor lange stegnavnene er og hvor bred knappeteksten er
 * («Neste» mot «Send til godkjenning»). Målt behov spenner fra rundt 950 px til
 * rundt 1340 px, mens action-baren typisk er 1030 px med sidebaren åpen og
 * 1490 px med den lukket. Vi måler derfor det faktiske behovet.
 *
 * Målingen kan ikke oscillere: beholderen fyller den tilgjengelige plassen
 * uavhengig av innholdet, så det å skjule navnene endrer ikke bredden vi
 * sammenligner mot.
 */
export const useHarPlassTilStegnavn = (stegsignatur: string): Plassmåling => {
    const beholderRef = useRef<HTMLDivElement>(null);
    const innholdRef = useRef<HTMLOListElement>(null);
    const nødvendigBredde = useRef(0);
    const måltSignatur = useRef<string | null>(null);
    const [harPlass, setHarPlass] = useState(true);

    useLayoutEffect(() => {
        const beholder = beholderRef.current;
        const innhold = innholdRef.current;
        if (!beholder || !innhold) return;

        // Ny stegsammensetning gir nytt plassbehov, og behovet kan bare måles
        // mens navnene er synlige. Vi viser dem derfor igjen før vi måler.
        if (måltSignatur.current !== stegsignatur) {
            måltSignatur.current = stegsignatur;
            nødvendigBredde.current = 0;
            if (!harPlass) {
                setHarPlass(true);
                return;
            }
        }

        const vurderPlass = (): void => {
            if (harPlass) {
                nødvendigBredde.current = innhold.scrollWidth;
            }
            const nyVerdi = nødvendigBredde.current <= beholder.clientWidth;
            if (nyVerdi !== harPlass) {
                setHarPlass(nyVerdi);
            }
        };

        vurderPlass();

        // Vi observerer også innholdet, ikke bare beholderen. Stegnavnene er som
        // regel smalere enn de skal være ved første måling, fordi webfonten ikke er
        // lastet ennå. Beholderen endrer ikke bredde når fonten kommer, så uten
        // dette ville den for lave målingen blitt stående til stegene endrer seg.
        const observatør = new ResizeObserver(vurderPlass);
        observatør.observe(beholder);
        observatør.observe(innhold);
        return (): void => observatør.disconnect();
    }, [stegsignatur, harPlass]);

    return { beholderRef, innholdRef, harPlass };
};
