import { useState } from 'react';

export type UseUlagretEndringerReturn = {
    harUlagredeData: boolean;
    settIkkePersistertKomponent: (komponentId: string) => void;
    nullstillIkkePersisterteKomponenter: () => void;
};

/**
 * Hook for å tracke komponenter med ulagrede endringer.
 * Kan brukes globalt eller lokalt i komponenter.
 */
export const useUlagretEndringer = (): UseUlagretEndringerReturn => {
    const tomtSet = new Set<string>();
    const [ikkePersisterteKomponenter, setIkkePersisterteKomponenter] =
        useState<Set<string>>(tomtSet);
    const harUlagredeData = ikkePersisterteKomponenter.size > 0;

    const settIkkePersistertKomponent = (komponentId: string): void => {
        if (ikkePersisterteKomponenter.has(komponentId)) return;
        setIkkePersisterteKomponenter(new Set(ikkePersisterteKomponenter).add(komponentId));
    };

    const nullstillIkkePersisterteKomponenter = (): void => {
        if (ikkePersisterteKomponenter.size > 0) {
            setIkkePersisterteKomponenter(tomtSet);
        }
    };

    return {
        harUlagredeData,
        settIkkePersistertKomponent,
        nullstillIkkePersisterteKomponenter,
    };
};
