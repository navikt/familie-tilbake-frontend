import { useState, useEffect } from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';

import { useHttp } from '@navikt/familie-http';
import { byggFeiletRessurs, byggHenterRessurs, IJournalpost, Ressurs } from '@navikt/familie-typer';

import { IBehandling } from '../../../../typer/behandling';
import { Menysider } from '../Menykontainer';

interface IProps {
    behandling: IBehandling;
    valgtMenyside: Menysider;
}

const [DokumentlistingProvider, useDokumentlisting] = createUseContext(
    ({ behandling, valgtMenyside }: IProps) => {
        const [journalposter, settJournalposter] = useState<Ressurs<IJournalpost[]>>();
        const { request } = useHttp();

        useEffect(() => {
            if (valgtMenyside === Menysider.DOKUMENTER) {
                hentDokumentlisting();
            }
        }, [behandling, valgtMenyside]);

        const hentDokumentlisting = (): void => {
            settJournalposter(byggHenterRessurs());
            request<void, IJournalpost[]>({
                method: 'GET',
                url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/journalposter`,
            })
                .then((hentetDokumenter: Ressurs<IJournalpost[]>) => {
                    settJournalposter(hentetDokumenter);
                })
                .catch((error: AxiosError) => {
                    console.log('Error ved henting av dokumentlisting: ', error);
                    settJournalposter(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av dokumentlisting for behandling'
                        )
                    );
                });
        };

        return {
            journalposter,
            behandling,
        };
    }
);

export { DokumentlistingProvider, useDokumentlisting };
