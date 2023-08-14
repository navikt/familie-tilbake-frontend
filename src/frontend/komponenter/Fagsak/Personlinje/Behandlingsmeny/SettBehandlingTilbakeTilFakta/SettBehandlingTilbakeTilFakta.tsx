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

const SettBehandlingTilbakeTilFakta: React.FC<IProps> = ({ behandling, onListElementClick }) => {
    const { request } = useHttp();
    const { settToast } = useApp();

    const settBehandlingTilbakeTilFakta = () => {
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/forvaltning/behandling/${behandling.behandlingId}/flytt-behandling/v1`,
        }).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.SUKSESS) {
                settToast(ToastTyper.FLYTT_BEHANDLING_TIL_FAKTA, {
                    alertType: AlertType.INFO,
                    tekst: 'Flyttet behandling tilbake til fakta',
                });
            } else if (
                respons.status === RessursStatus.FEILET ||
                respons.status === RessursStatus.FUNKSJONELL_FEIL ||
                respons.status === RessursStatus.IKKE_TILGANG
            ) {
                settToast(ToastTyper.FLYTT_BEHANDLING_TIL_FAKTA, {
                    alertType: AlertType.WARNING,
                    tekst: 'Flytting av behandling tilbake til fakta feilet',
                });
            }
        });
    };

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    settBehandlingTilbakeTilFakta();
                    onListElementClick();
                }}
                disabled={!behandling.kanEndres}
            >
                {'Sett behanling tilbake til fakta'}
            </BehandlingsMenyButton>
        </>
    );
};

export default SettBehandlingTilbakeTilFakta;
