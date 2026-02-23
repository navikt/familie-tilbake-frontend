import type { Toggles } from './toggles';

import createUseContext from 'constate';
import { useCallback, useEffect, useState } from 'react';

import { useHttp } from '~/api/http/HttpProvider';
import { type Ressurs, RessursStatus } from '~/typer/ressurs';
import { hentFrontendFeilmelding } from '~/utils';

export type TogglesHook = {
    toggles: Toggles;
    feilmelding: string;
};

const [TogglesProvider, useToggles] = createUseContext(() => {
    const [toggles, settToggles] = useState<Toggles>({});
    const [feilmelding, settFeilmelding] = useState<string>('');
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
                settFeilmelding('');
                if (resp.status === RessursStatus.Suksess) {
                    settToggles(resp.data);
                } else if (hentFrontendFeilmelding(resp)) {
                    settFeilmelding('Kunne ikke hente toggles');
                }
            })
            .catch(() => {
                settFeilmelding('Kunne ikke hente toggles');
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchToggles();
    }, [fetchToggles]);

    return { toggles, feilmelding };
});

export { TogglesProvider, useToggles };
