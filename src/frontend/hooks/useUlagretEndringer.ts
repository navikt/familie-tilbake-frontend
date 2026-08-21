import { useCallback, useState } from 'react';

export type UseUlagretEndringerReturn = {
    harUlagredeData: boolean;
    setIkkePersistertKomponent: (komponentId: string) => void;
    nullstillIkkePersisterteKomponenter: () => void;
};

/**
 * Hook for å tracke komponenter med ulagrede endringer.
 * Kan brukes globalt eller lokalt i komponenter.
 */
export const useUlagretEndringer = (): UseUlagretEndringerReturn => {
    const [ikkePersisterteKomponenter, setIkkePersisterteKomponenter] = useState<Set<string>>(
        () => new Set<string>()
    );
    const harUlagredeData = ikkePersisterteKomponenter.size > 0;

    const setIkkePersistertKomponent = useCallback((komponentId: string): void => {
        setIkkePersisterteKomponenter(forrige =>
            forrige.has(komponentId) ? forrige : new Set(forrige).add(komponentId)
        );
    }, []);

    const nullstillIkkePersisterteKomponenter = useCallback((): void => {
        setIkkePersisterteKomponenter(forrige => (forrige.size > 0 ? new Set<string>() : forrige));
    }, []);

    return {
        harUlagredeData,
        setIkkePersistertKomponent,
        nullstillIkkePersisterteKomponenter,
    };
};
