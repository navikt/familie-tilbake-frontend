import type { Behandling } from '../../../../typer/behandling';

import { Dropdown } from '@navikt/ds-react';
import * as React from 'react';

import { useHttp } from '../../../../api/http/HttpProvider';
import { useApp } from '../../../../context/AppContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../../hooks/useRedirectEtterLagring';
import { useFagsakStore } from '../../../../stores/fagsakStore';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';
import { AlertType, ToastTyper } from '../../../Felleskomponenter/Toast/typer';

type Props = {
    behandling: Behandling;
};

export const HentOppdatertKravgrunnlag: React.FC<Props> = ({ behandling }) => {
    const { request } = useHttp();
    const { settToast } = useApp();
    const { hentBehandlingMedBehandlingId, nullstillIkkePersisterteKomponenter } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();
    const { fagsystem, eksternFagsakId } = useFagsakStore();

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
        <Dropdown.Menu.List.Item
            onClick={hentKorrigertKravgrunnlag}
            disabled={!behandling.kanEndres}
        >
            Hent korrigert kravgrunnlag
        </Dropdown.Menu.List.Item>
    );
};
