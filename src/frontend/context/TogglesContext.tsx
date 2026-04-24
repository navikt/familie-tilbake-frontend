import type { Toggles } from './toggles';

import createUseContext from 'constate';
import { useEffect, useEffectEvent, useState } from 'react';

import { useHttp } from '~/api/http/HttpProvider';
import { type Ressurs, RessursStatus } from '~/typer/ressurs';
import { hentFrontendFeilmelding } from '~/utils';

export type TogglesHook = {
    toggles: Toggles;
    feilmelding: string;
};

const [TogglesProvider, useToggles] = createUseContext(() => {
    const [toggles, setToggles] = useState<Toggles>({});
    const [feilmelding, setFeilmelding] = useState<string>('');
    const { request } = useHttp();
    TogglesProvider.displayName = 'TOGGLES_PROVIDER';

    const fetchToggles = useEffectEvent(() => {
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
                setFeilmelding('Kunne ikke hente toggles');
            });
    });

    useEffect(() => {
        fetchToggles();
    }, []);

    return { toggles, feilmelding };
});

export { TogglesProvider, useToggles };
