import type { BehandlingDto } from '../../../../generated';

import { HddUpIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { useHttp } from '../../../../api/http/HttpProvider';
import { useApp } from '../../../../context/AppContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { useFagsak } from '../../../../context/FagsakContext';
import { useRedirectEtterLagring } from '../../../../hooks/useRedirectEtterLagring';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';
import { AlertType, ToastTyper } from '../../../Felleskomponenter/Toast/typer';

type Props = {
    behandling: BehandlingDto;
};

export const HentKorrigertKravgrunnlag: React.FC<Props> = ({ behandling }) => {
    const { request } = useHttp();
    const { settToast } = useApp();
    const queryClient = useQueryClient();
    const { nullstillIkkePersisterteKomponenter } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();
    const { fagsystem, eksternFagsakId } = useFagsak();

    const hentKorrigertKravgrunnlag = (): void => {
        nullstillIkkePersisterteKomponenter();
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/forvaltning/behandling/${behandling.behandlingId}/kravgrunnlag/v1`,
        }).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.Suksess && fagsystem && eksternFagsakId) {
                settToast(ToastTyper.KravgrunnlaHentet, {
                    alertType: AlertType.Info,
                    tekst: 'Hentet korrigert kravgrunnlag',
                });

                queryClient.invalidateQueries({
                    queryKey: ['behandling', behandling.behandlingId],
                });
                utførRedirect(
                    `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                );
            } else if (
                respons.status === RessursStatus.Feilet ||
                respons.status === RessursStatus.FunksjonellFeil ||
                respons.status === RessursStatus.IkkeTilgang
            ) {
                settToast(ToastTyper.KravgrunnlaHentet, {
                    alertType: AlertType.Warning,
                    tekst: 'Henting av korrigert kravgrunnlag feilet',
                });
            }
        });
    };

    return (
        <ActionMenu.Item
            onSelect={hentKorrigertKravgrunnlag}
            className="text-xl cursor-pointer"
            icon={<HddUpIcon aria-hidden />}
        >
            <span className="ml-1">Hent korrigert kravgrunnlag</span>
        </ActionMenu.Item>
    );
};
