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
    const registrer = useActionBarStore(s => s.registrer);
    const avregistrer = useActionBarStore(s => s.avregistrer);

    // Synkroniser config etter hver render slik at reaktive verdier
    // (isLoading, disableNeste, etc.) alltid er oppdaterte i storen.
    useEffect(() => {
        registrer(config);
    });

    useEffect(() => {
        return (): void => {
            avregistrer();
        };
    }, [avregistrer]);
};
