import type { Fagsystem } from '../kodeverk';
import type { IFagsak } from '../typer/fagsak';
import type { AxiosError } from 'axios';

import createUseContext from 'constate';
import * as React from 'react';

import { useHttp } from '../api/http/HttpProvider';
import { byggFeiletRessurs, byggHenterRessurs, type Ressurs } from '../typer/ressurs';

const [FagsakProvider, useFagsak] = createUseContext(() => {
    const [fagsak, settFagsak] = React.useState<Ressurs<IFagsak>>();
    const { request } = useHttp();

    const hentFagsak = (fagsystem: Fagsystem, eksternFagsakId: string): void => {
        settFagsak(byggHenterRessurs());
        request<void, IFagsak>({
            method: 'GET',
            url: `/familie-tilbake/api/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/v1`,
        })
            .then((hentetFagsak: Ressurs<IFagsak>) => {
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
