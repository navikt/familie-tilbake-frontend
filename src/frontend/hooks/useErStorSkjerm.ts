import { useSyncExternalStore } from 'react';

/** Samme grense som Tailwind-varianten `ax-lg`, der sidebaren får plass som panel. */
const STOR_SKJERM = '(min-width: 1024px)';

const abonner = (varsle: () => void): (() => void) => {
    const mediaspørring = window.matchMedia(STOR_SKJERM);
    mediaspørring.addEventListener('change', varsle);
    return (): void => mediaspørring.removeEventListener('change', varsle);
};

const lesVerdi = (): boolean => window.matchMedia(STOR_SKJERM).matches;

/**
 * Forteller om skjermen er bred nok til å vise sidebaren som et panel ved siden av
 * innholdet. På smalere skjermer vises informasjonen i en modal i stedet.
 */
export const useErStorSkjerm = (): boolean => useSyncExternalStore(abonner, lesVerdi, () => true);
