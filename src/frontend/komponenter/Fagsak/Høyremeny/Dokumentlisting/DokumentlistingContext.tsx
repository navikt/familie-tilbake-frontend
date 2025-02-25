import type { IBehandling } from '../../../../typer/behandling';
import type { IJournalpost } from '../../../../typer/journalføring';
import type { AxiosError } from 'axios';

import createUseContext from 'constate';
import { useState, useEffect } from 'react';

import { useHttp } from '../../../../api/http/HttpProvider';
import { byggFeiletRessurs, byggHenterRessurs, type Ressurs } from '../../../../typer/ressurs';
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
            if (valgtMenyside === Menysider.Dokumenter) {
                hentDokumentlisting();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
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
