import type { Behandling } from '../../../../typer/behandling';

import { HddUpIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import * as React from 'react';

import { useHttp } from '../../../../api/http/HttpProvider';
import { useApp } from '../../../../context/AppContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { useFagsak } from '../../../../context/FagsakContext';
import { useRedirectEtterLagring } from '../../../../hooks/useRedirectEtterLagring';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';
import { AlertType, ToastTyper } from '../../../Felleskomponenter/Toast/typer';

type Props = {
    behandling: Behandling;
};

export const HentKorrigertKravgrunnlag: React.FC<Props> = ({ behandling }) => {
    const { request } = useHttp();
    const { settToast } = useApp();
    const { hentBehandlingMedBehandlingId, nullstillIkkePersisterteKomponenter } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();
    const { fagsak } = useFagsak();
    const fagsystem = fagsak.fagsystem;
    const eksternFagsakId = fagsak.eksternFagsakId;

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
                hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                    utførRedirect(
                        `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                    );
                });
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
