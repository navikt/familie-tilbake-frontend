import createUseContext from 'constate';
import { useCallback, useEffect, useState } from 'react';

import { useHttp } from '@/api/http/HttpProvider';
import { type Ressurs, RessursStatus } from '@/typer/ressurs';
import { hentFrontendFeilmelding } from '@/utils';

export enum ToggleName {
    Vilkårsvurdering = 'tilbakekreving-frontend.nytt-vilkaarsvurderingssteg',
    Forhaandsvarsel = 'familie-tilbake-frontend.forhaandsvarselsteg',
}

type Toggles = {
    [key: string]: boolean;
};

const [TogglesProvider, useToggles] = createUseContext(() => {
    const [toggles, setToggles] = useState<Toggles>({});
    const [feilmelding, setFeilmelding] = useState<string>('');
    const { request } = useHttp();
    TogglesProvider.displayName = 'TOGGLES_PROVIDER';

    const fetchToggles = useCallback(() => {
        const hentToggles = (): Promise<Ressurs<Toggles>> => {
            return request<void, Toggles>({
                url: `/familie-tilbake/api/featuretoggle`,
                method: 'GET',
            });
        };

        hentToggles()
            .then((resp: Ressurs<Toggles>) => {
                setFeilmelding('');
                if (resp.status === RessursStatus.Suksess) {
                    setToggles(resp.data);
                } else if (hentFrontendFeilmelding(resp)) {
                    setFeilmelding('Kunne ikke hente toggles');
                }
            })
            .catch(() => {
                // False positive: setState skjer i .catch og er derfor asynkront. Bør uansett migreres til TanStack Query (useQuery) slik at server state håndteres uten useEffect.
                setFeilmelding('Kunne ikke hente toggles');
            });
    }, [request]);

    useEffect(() => {
        fetchToggles();
    }, [fetchToggles]);

    return { toggles, feilmelding };
});

export { TogglesProvider, useToggles };
