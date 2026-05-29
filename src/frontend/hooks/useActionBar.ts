import { useEffect } from 'react';

import { type ActionBarConfig, useActionBarStore } from '~/stores/actionBarStore';

/**
 * Hook for å deklarere ActionBar-konfigurasjon for et steg.
 * Registrerer config ved mount og etter hver render (slik at isLoading, disableNeste
 * og andre reaktive verdier holdes oppdatert). Avregistrerer automatisk ved unmount.
 *
 * @example
 * useActionBar({
 *     stegtekst: actionBarStegtekst('FAKTA'),
 *     nesteAriaLabel: 'Gå til neste steg',
 *     forrigeAriaLabel: undefined,
 *     onNeste: navigerTilNeste,
 *     onForrige: undefined,
 *     isLoading: mutation.isPending,
 * });
 */
export const useActionBar = (config: ActionBarConfig): void => {
    useEffect(() => {
        useActionBarStore.getState().registrer(config);
    });

    useEffect(() => {
        return (): void => {
            useActionBarStore.getState().avregistrer();
        };
    }, []);
};
