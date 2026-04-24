import type { Journalpost } from '~/typer/journalføring';

import createUseContext from 'constate';
import { useState, useEffect } from 'react';

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

        useEffect(() => {
            if (valgtMenyside === Menysider.Dokumenter) {
                hentDokumentlisting();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps -- TODO: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
        }, [behandlingId, valgtMenyside]);

        const hentDokumentlisting = (): void => {
            // eslint-disable-next-line @eslint-react/set-state-in-effect -- setState-kall for lastetilstand i en fetch-funksjon som kalles fra useEffect. Bør migreres til TanStack Query (useQuery) slik at server state håndteres uten useEffect.
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
