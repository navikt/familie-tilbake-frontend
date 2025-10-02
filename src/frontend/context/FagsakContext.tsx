import type { Fagsystem } from '../kodeverk';
import type { Fagsak } from '../typer/fagsak';
import type { AxiosError } from 'axios';

import createUseContext from 'constate';
import * as React from 'react';

import { useHttp } from '../api/http/HttpProvider';
import { byggFeiletRessurs, byggHenterRessurs, type Ressurs } from '../typer/ressurs';

export type FagsakHook = {
    fagsak: Ressurs<Fagsak> | undefined;
    hentFagsak: (fagsystem: Fagsystem, eksternFagsakId: string) => void;
};

const [FagsakProvider, useFagsak] = createUseContext(() => {
    const [fagsak, settFagsak] = React.useState<Ressurs<Fagsak>>();
    const { request } = useHttp();

    const hentFagsak = (fagsystem: Fagsystem, eksternFagsakId: string): void => {
        settFagsak(byggHenterRessurs());
        request<void, Fagsak>({
            method: 'GET',
            url: `/familie-tilbake/api/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/v1`,
        })
            .then((hentetFagsak: Ressurs<Fagsak>) => {
                settFagsak(hentetFagsak);
            })

            .catch((error: AxiosError) => {
                settFagsak(byggFeiletRessurs('Ukjent feil ved henting av fagsak', error.status));
            });
    };

    return {
        fagsak,
        hentFagsak,
    };
});

export { FagsakProvider, useFagsak };
