import * as React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';

import { useHttp } from '../../backend/http/HttpProvider';

import { Fagsystem } from '../kodeverk';
import { IFagsak } from '../typer/fagsak';
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
        return fagsak?.status === RessursStatus.SUKSESS
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
