import { useCallback, useSyncExternalStore } from 'react';

/**
 * Returnerer `true` når viewport-høyden er under en gitt grense.
 * Reagerer dynamisk på endringer (f.eks. zoom, resize).
 *
 * Viewport-høyde brukes som proxy for zoom-nivå, da nettlesere
 * ikke eksponerer zoom direkte. 125 % zoom på en 1080p-skjerm
 * gir omtrent 860 px effektiv viewport-høyde.
 */
export const useLavViewportHøyde = (grense = 850): boolean => {
    const subscribe = useCallback(
        (callback: () => void) => {
            const mq = window.matchMedia(`(max-height: ${grense}px)`);
            mq.addEventListener('change', callback);
            return (): void => mq.removeEventListener('change', callback);
        },
        [grense]
    );

    const getSnapshot = useCallback(
        () => window.matchMedia(`(max-height: ${grense}px)`).matches,
        [grense]
    );

    return useSyncExternalStore(subscribe, getSnapshot);
};
