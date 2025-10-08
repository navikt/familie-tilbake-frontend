import type { Fagsystem } from '../kodeverk';
import type { Fagsak } from '../typer/fagsak';
import type { AxiosError } from 'axios';

import createUseContext from 'constate';
import { useState } from 'react';

import { useHttp } from '../api/http/HttpProvider';
import { useFagsakStore } from '../stores/fagsakStore';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    RessursStatus,
    type Ressurs,
} from '../typer/ressurs';

export type FagsakHook = {
    fagsak: Ressurs<Fagsak> | undefined;
    hentFagsak: (fagsystem: Fagsystem, eksternFagsakId: string) => void;
};

const [FagsakProvider, useFagsak] = createUseContext(() => {
    const [fagsak, settFagsak] = useState<Ressurs<Fagsak> | undefined>();
    const setEksternFagsakId = useFagsakStore(state => state.setEksternFagsakId);
    const setYtelsestype = useFagsakStore(state => state.setYtelsestype);
    const setFagSystem = useFagsakStore(state => state.setFagsystem);
    const setSpråkkode = useFagsakStore(state => state.setSpråkkode);
    const { request } = useHttp();

    const hentFagsak = (fagsystem: Fagsystem, eksternFagsakId: string): void => {
        settFagsak(byggHenterRessurs());
        request<void, Fagsak>({
            method: 'GET',
            url: `/familie-tilbake/api/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/v1`,
        })
            .then((hentetFagsak: Ressurs<Fagsak>) => {
                if (hentetFagsak.status === RessursStatus.Suksess) {
                    setEksternFagsakId(hentetFagsak.data.eksternFagsakId);
                    setYtelsestype(hentetFagsak.data.ytelsestype);
                    setFagSystem(hentetFagsak.data.fagsystem);
                    setSpråkkode(hentetFagsak.data.språkkode);
                }
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
