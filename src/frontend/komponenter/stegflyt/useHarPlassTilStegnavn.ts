import type { RefObject } from 'react';

import { useLayoutEffect, useRef, useState } from 'react';

type Plassmåling = {
    beholderRef: RefObject<HTMLDivElement | null>;
    innholdRef: RefObject<HTMLOListElement | null>;
    harPlass: boolean;
};

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

        const observatør = new ResizeObserver(vurderPlass);
        observatør.observe(beholder);
        observatør.observe(innhold);
        return (): void => observatør.disconnect();
    }, [stegsignatur, harPlass]);

    return { beholderRef, innholdRef, harPlass };
};
