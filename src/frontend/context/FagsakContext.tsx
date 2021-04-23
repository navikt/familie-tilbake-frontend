import * as React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';

import { useHttp } from '@navikt/familie-http';
import { byggFeiletRessurs, byggHenterRessurs, Ressurs } from '@navikt/familie-typer';

import { Fagsystem } from '../kodeverk';
import { IFagsak } from '../typer/fagsak';

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
            .catch((_error: AxiosError) => {
                settFagsak(byggFeiletRessurs('Ukjent feil ved henting av fagsak'));
            });
    };

    return {
        fagsak,
        hentFagsak,
    };
});

export { FagsakProvider, useFagsak };
