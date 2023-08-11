import * as React from 'react';

import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useApp } from '../../../../../context/AppContext';
import { IBehandling } from '../../../../../typer/behandling';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';
import { AlertType, ToastTyper } from '../../../../Felleskomponenter/Toast/typer';

interface IProps {
    behandling: IBehandling;
    onListElementClick: () => void;
}

const HentOppdatertKravgrunnlag: React.FC<IProps> = ({ behandling, onListElementClick }) => {
    const { request } = useHttp();
    const { settToast } = useApp();

    const hentKorrigertKravgrunnlag = () => {
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/forvaltning/behandling/${behandling.behandlingId}/kravgrunnlag/v1`,
        }).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.SUKSESS) {
                settToast(ToastTyper.KRAVGRUNNLAG_HENTET, {
                    alertType: AlertType.WARNING,
                    tekst: 'Hentet korrigert kravgrunnlag',
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
                {'Hent korrigert kravgrunnlag'}
            </BehandlingsMenyButton>
        </>
    );
};

export default HentOppdatertKravgrunnlag;
