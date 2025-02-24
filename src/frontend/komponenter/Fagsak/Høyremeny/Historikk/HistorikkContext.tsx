import { useState, useEffect } from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';
import { useNavigate } from 'react-router-dom';

import { IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { IHistorikkInnslag } from '../../../../typer/historikk';
import { ISide } from '../../../Felleskomponenter/Venstremeny/sider';
import { Menysider } from '../Menykontainer';
import { byggFeiletRessurs, byggHenterRessurs, type Ressurs } from '../../../../typer/ressurs';
import { useHttp } from '../../../../api/http/HttpProvider';

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    valgtMenyside: Menysider;
}

const [HistorikkProvider, useHistorikk] = createUseContext(
    ({ fagsak, behandling, valgtMenyside }: IProps) => {
        const [historikkInnslag, settHistorikkInnslag] = useState<Ressurs<IHistorikkInnslag[]>>();
        const navigate = useNavigate();
        const { request } = useHttp();

        useEffect(() => {
            if (valgtMenyside === Menysider.HISTORIKK) {
                hentHistorikkinnslag();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [behandling, valgtMenyside]);

        const hentHistorikkinnslag = (): void => {
            settHistorikkInnslag(byggHenterRessurs());
            request<void, IHistorikkInnslag[]>({
                method: 'GET',
                url: `/familie-tilbake/api/behandlinger/${behandling.behandlingId}/historikk`,
            })
                .then((hentetHistorikk: Ressurs<IHistorikkInnslag[]>) => {
                    settHistorikkInnslag(hentetHistorikk);
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
                    settHistorikkInnslag(
                        byggFeiletRessurs('Ukjent feil ved henting av logg for behandling')
                    );
                });
        };

        const navigerTilSide = (side: ISide) => {
            navigate(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${side.href}`
            );
        };

        return {
            behandling,
            historikkInnslag,
            navigerTilSide,
        };
    }
);

export { HistorikkProvider, useHistorikk };
