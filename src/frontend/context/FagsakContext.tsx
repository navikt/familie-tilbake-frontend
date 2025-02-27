import type { Fagsystem } from '../kodeverk';
import type { IFagsak } from '../typer/fagsak';
import type { AxiosError } from 'axios';

import createUseContext from 'constate';
import * as React from 'react';

import { useHttp } from '../api/http/HttpProvider';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../typer/ressurs';

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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch((_error: AxiosError) => {
                settFagsak(byggFeiletRessurs('Ukjent feil ved henting av fagsak'));
            });
    };

    const lagSaksoversiktUrl = () => {
        return fagsak?.status === RessursStatus.Suksess
            ? `/redirect/fagsystem/${fagsak.data.fagsystem}/fagsak/${fagsak.data.eksternFagsakId}/saksoversikt`
            : '#';
    };

    return {
        fagsak,
        hentFagsak,
        lagSaksoversiktUrl,
    };
});

export { FagsakProvider, useFagsak };
