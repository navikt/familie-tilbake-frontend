import type { Journalpost } from '~/typer/journalføring';

import createUseContext from 'constate';
import { useEffect, useEffectEvent, useState } from 'react';

import { useHttp } from '~/api/http/HttpProvider';
import { useBehandling } from '~/context/BehandlingContext';
import { Menysider } from '~/komponenter/sidebar/OversiktOgHandlingerInnhold';
import { byggFeiletRessurs, byggHenterRessurs, type Ressurs } from '~/typer/ressurs';

type Props = {
    valgtMenyside: Menysider | null;
};

const [DokumentlistingProvider, useDokumentlisting] = createUseContext(
    ({ valgtMenyside }: Props) => {
        const { behandlingId } = useBehandling();
        const [journalposter, setJournalposter] = useState<Ressurs<Journalpost[]>>();
        const { request } = useHttp();

        const hentDokumenterVedEndring = useEffectEvent((aktivMenyside: Menysider | null) => {
            if (aktivMenyside === Menysider.Dokumenter) {
                hentDokumentlisting();
            }
        });

        useEffect(() => {
            hentDokumenterVedEndring(valgtMenyside);
        }, [behandlingId, valgtMenyside]);

        const hentDokumentlisting = (): void => {
            setJournalposter(byggHenterRessurs());
            request<void, Journalpost[]>({
                method: 'GET',
                url: `/familie-tilbake/api/behandling/${behandlingId}/journalposter`,
            })
                .then((hentetDokumenter: Ressurs<Journalpost[]>) => {
                    setJournalposter(hentetDokumenter);
                })
                .catch(() => {
                    setJournalposter(
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
