import type { Journalpost } from '@/typer/journalføring';

import createUseContext from 'constate';
import { useEffect, useState } from 'react';

import { useHttp } from '@/api/http/HttpProvider';
import { useBehandling } from '@/context/BehandlingContext';
import { byggFeiletRessurs, byggHenterRessurs, type Ressurs } from '@/typer/ressurs';

const [DokumentlistingProvider, useDokumentlisting] = createUseContext(() => {
    const { behandlingId } = useBehandling();
    const [journalposter, setJournalposter] = useState<Ressurs<Journalpost[]>>();
    const { request } = useHttp();

    // biome-ignore lint/correctness/useExhaustiveDependencies: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
    useEffect(() => {
        hentDokumentlisting();
    }, [behandlingId]);

    const hentDokumentlisting = (): void => {
        // setState-kall for lastetilstand i en fetch-funksjon som kalles fra useEffect. Bør migreres til TanStack Query (useQuery) slik at server state håndteres uten useEffect.
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
                    byggFeiletRessurs('Ukjent feil ved henting av dokumentlisting for behandling')
                );
            });
    };

    return {
        journalposter,
    };
});

export { DokumentlistingProvider, useDokumentlisting };
