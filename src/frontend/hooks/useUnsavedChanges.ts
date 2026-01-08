import { useEffect, useState } from 'react';

export type UseUnsavedChangesReturn = {
    harUlagredeData: boolean;
    settIkkePersistertKomponent: (komponentId: string) => void;
    nullstillIkkePersisterteKomponenter: () => void;
};

/**
 * Hook for å tracke komponenter med ulagrede endringer.
 * Kan brukes globalt eller lokalt i komponenter.
 */
export const useUnsavedChanges = (): UseUnsavedChangesReturn => {
    const [ikkePersisterteKomponenter, settIkkePersisterteKomponenter] = useState<Set<string>>(
        new Set()
    );
    const [harUlagredeData, settHarUlagredeData] = useState(false);

    useEffect(() => {
        settHarUlagredeData(ikkePersisterteKomponenter.size > 0);
    }, [ikkePersisterteKomponenter]);

    const settIkkePersistertKomponent = (komponentId: string): void => {
        if (ikkePersisterteKomponenter.has(komponentId)) return;
        settIkkePersisterteKomponenter(new Set(ikkePersisterteKomponenter).add(komponentId));
    };

    const nullstillIkkePersisterteKomponenter = (): void => {
        if (ikkePersisterteKomponenter.size > 0) {
            settIkkePersisterteKomponenter(new Set());
        }
    };

    return {
        harUlagredeData,
        settIkkePersistertKomponent,
        nullstillIkkePersisterteKomponenter,
    };
};
