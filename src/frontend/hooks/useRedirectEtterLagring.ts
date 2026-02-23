import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useBehandlingState } from '~/context/BehandlingStateContext';

export type RedirectEtterLagringHook = {
    utførRedirect: (url: string) => void;
};

/**
 * Denne trengs fordi vi bruker blocker i react-router for å sperre for å navigere når man har ulagret data.
 * Den sperren gjør at vi heller ikke klarer å navigere videre etter lagring og nullstilling av ulagret data.
 * For å omgå sperren må vi vente på at ulagretData er satt til false samtidig som vi sier at vi ønsker å navigere videre.
 * Dette fungerer ikke inni komponenten, så vi må ha denne hooken for å omgå problemet.
 */
export const useRedirectEtterLagring = (): RedirectEtterLagringHook => {
    const navigate = useNavigate();
    const { harUlagredeData } = useBehandlingState();
    const [url, settUrl] = useState<string>();

    useEffect(() => {
        if (url && !harUlagredeData) {
            navigate(url);
        }
    }, [url, harUlagredeData, navigate]);

    return {
        utførRedirect: (url: string): void => {
            settUrl(url);
        },
    };
};
