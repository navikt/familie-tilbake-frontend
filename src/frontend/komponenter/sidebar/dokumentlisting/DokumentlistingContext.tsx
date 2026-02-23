import type { Journalpost } from '~/typer/journalføring';

import createUseContext from 'constate';
import { useState, useEffect } from 'react';

import { useHttp } from '~/api/http/HttpProvider';
import { useBehandling } from '~/context/BehandlingContext';
import { Menysider } from '~/komponenter/sidebar/Menykontainer';
import { byggFeiletRessurs, byggHenterRessurs, type Ressurs } from '~/typer/ressurs';

type Props = {
    valgtMenyside: Menysider | null;
};

const [DokumentlistingProvider, useDokumentlisting] = createUseContext(
    ({ valgtMenyside }: Props) => {
        const { behandlingId } = useBehandling();
        const [journalposter, settJournalposter] = useState<Ressurs<Journalpost[]>>();
        const { request } = useHttp();

        useEffect(() => {
            if (valgtMenyside === Menysider.Dokumenter) {
                hentDokumentlisting();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [behandlingId, valgtMenyside]);

        const hentDokumentlisting = (): void => {
            settJournalposter(byggHenterRessurs());
            request<void, Journalpost[]>({
                method: 'GET',
                url: `/familie-tilbake/api/behandling/${behandlingId}/journalposter`,
            })
                .then((hentetDokumenter: Ressurs<Journalpost[]>) => {
                    settJournalposter(hentetDokumenter);
                })
                .catch(() => {
                    settJournalposter(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av dokumentlisting for behandling'
                        )
                    );
                });
        };

        return {
            journalposter,
        };
    }
);

export { DokumentlistingProvider, useDokumentlisting };
