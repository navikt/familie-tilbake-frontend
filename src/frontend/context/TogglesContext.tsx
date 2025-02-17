import { useCallback, useEffect, useState } from 'react';

import createUseContext from 'constate';

import { useHttp } from '@navikt/familie-http';

import { Toggles } from './toggles';
import { hentFrontendFeilmelding } from '../utils';
import { type Ressurs, RessursStatus } from '../typer/ressurs';

const [TogglesProvider, useToggles] = createUseContext(() => {
    const [toggles, settToggles] = useState<Toggles>({});
    const [feilmelding, settFeilmelding] = useState<string>('');
    const { request } = useHttp();
    TogglesProvider.displayName = 'TOGGLES_PROVIDER';

    const fetchToggles = useCallback(() => {
        const hentToggles = () => {
            return request<void, Toggles>({
                url: `/familie-tilbake/api/featuretoggle`,
                method: 'GET',
            });
        };

        hentToggles()
            .then((resp: Ressurs<Toggles>) => {
                settFeilmelding('');
                if (resp.status === RessursStatus.SUKSESS) {
                    settToggles(resp.data);
                } else if (hentFrontendFeilmelding(resp)) {
                    settFeilmelding('Kunne ikke hente toggles');
                }
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch((_: Error) => {
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
