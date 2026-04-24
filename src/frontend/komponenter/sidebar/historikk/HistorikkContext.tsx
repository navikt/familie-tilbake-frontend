import type { HistorikkInnslag } from '~/typer/historikk';
import type { SynligSteg } from '~/utils/sider';

import createUseContext from 'constate';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useHttp } from '~/api/http/HttpProvider';
import { useBehandling } from '~/context/BehandlingContext';
import { useFagsak } from '~/context/FagsakContext';
import { Menysider } from '~/komponenter/sidebar/OversiktOgHandlingerInnhold';
import { byggFeiletRessurs, byggHenterRessurs, type Ressurs } from '~/typer/ressurs';

type Props = {
    valgtMenyside: Menysider;
};

const [HistorikkProvider, useHistorikk] = createUseContext(({ valgtMenyside }: Props) => {
    const behandling = useBehandling();
    const { fagsystem, eksternFagsakId } = useFagsak();
    const [historikkInnslag, setHistorikkInnslag] = useState<Ressurs<HistorikkInnslag[]>>();
    const navigate = useNavigate();
    const { request } = useHttp();

    useEffect(() => {
        if (valgtMenyside === Menysider.Historikk) {
            hentHistorikkinnslag();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling, valgtMenyside]);

    const hentHistorikkinnslag = (): void => {
        // eslint-disable-next-line @eslint-react/set-state-in-effect -- setState-kall for lastetilstand i en fetch-funksjon som kalles fra useEffect. Bør migreres til TanStack Query (useQuery) slik at server state håndteres uten useEffect.
        setHistorikkInnslag(byggHenterRessurs());
        request<void, HistorikkInnslag[]>({
            method: 'GET',
            url: `/familie-tilbake/api/behandlinger/${behandling.behandlingId}/historikk`,
        })
            .then((hentetHistorikk: Ressurs<HistorikkInnslag[]>) => {
                setHistorikkInnslag(hentetHistorikk);
            })
            .catch(() => {
                setHistorikkInnslag(
                    byggFeiletRessurs('Ukjent feil ved henting av logg for behandling')
                );
            });
    };

    const navigerTilSide = (side: SynligSteg): void => {
        navigate(
            `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}/${side.href}`
        );
    };

    return {
        historikkInnslag,
        navigerTilSide,
    };
});

export { HistorikkProvider, useHistorikk };
