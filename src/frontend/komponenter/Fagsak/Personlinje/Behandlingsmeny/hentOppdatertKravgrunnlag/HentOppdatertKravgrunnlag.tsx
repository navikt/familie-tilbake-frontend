import type { IBehandling } from '../../../../../typer/behandling';
import type { IFagsak } from '../../../../../typer/fagsak';

import * as React from 'react';

import { useHttp } from '../../../../../api/http/HttpProvider';
import { useApp } from '../../../../../context/AppContext';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../../../hooks/useRedirectEtterLagring';
import { type Ressurs, RessursStatus } from '../../../../../typer/ressurs';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';
import { AlertType, ToastTyper } from '../../../../Felleskomponenter/Toast/typer';

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    onListElementClick: () => void;
}

const HentOppdatertKravgrunnlag: React.FC<IProps> = ({
    behandling,
    fagsak,
    onListElementClick,
}) => {
    const { request } = useHttp();
    const { settToast } = useApp();
    const { hentBehandlingMedBehandlingId, nullstillIkkePersisterteKomponenter } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();

    const hentKorrigertKravgrunnlag = () => {
        nullstillIkkePersisterteKomponenter();
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/forvaltning/behandling/${behandling.behandlingId}/kravgrunnlag/v1`,
        }).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.SUKSESS) {
                settToast(ToastTyper.KRAVGRUNNLAG_HENTET, {
                    alertType: AlertType.INFO,
                    tekst: 'Hentet korrigert kravgrunnlag',
                });
                hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                    utførRedirect(
                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                    );
                });
            } else if (
                respons.status === RessursStatus.FEILET ||
                respons.status === RessursStatus.FUNKSJONELL_FEIL ||
                respons.status === RessursStatus.IKKE_TILGANG
            ) {
                settToast(ToastTyper.KRAVGRUNNLAG_HENTET, {
                    alertType: AlertType.WARNING,
                    tekst: 'Henting av korrigert kravgrunnlag feilet',
                });
            }
        });
    };

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    hentKorrigertKravgrunnlag();
                    onListElementClick();
                }}
                disabled={!behandling.kanEndres}
            >
                Hent korrigert kravgrunnlag
            </BehandlingsMenyButton>
        </>
    );
};

export default HentOppdatertKravgrunnlag;
