import * as React from 'react';

import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { Behandlingssteg, IBehandling } from '../../../../../typer/behandling';
import { BehandlingsMenyButton, FTButton } from '../../../../Felleskomponenter/Flytelementer';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';

interface IProps {
    behandling: IBehandling;
    onListElementClick: () => void;
}

const OpprettFjernVerge: React.FC<IProps> = ({ behandling, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const [senderInn, settSenderInn] = React.useState<boolean>(false);
    const { hentBehandlingMedBehandlingId, aktivtSteg, behandlingILesemodus } = useBehandling();
    const { request } = useHttp();

    const kanFjerneVerge =
        behandling.harVerge || aktivtSteg?.behandlingssteg === Behandlingssteg.VERGE;

    const opprettVerge = () => {
        request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/behandling/v1/${behandling.behandlingId}/verge`,
        }).then((respons: Ressurs<string>) => {
            settSenderInn(false);
            if (respons.status === RessursStatus.SUKSESS) {
                settVisModal(false);
                hentBehandlingMedBehandlingId(behandling.behandlingId, true);
            }
        });
    };

    const fjernVerge = () => {
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/v1/${behandling.behandlingId}/verge`,
        }).then((respons: Ressurs<string>) => {
            settSenderInn(false);
            if (respons.status === RessursStatus.SUKSESS) {
                settVisModal(false);
                hentBehandlingMedBehandlingId(behandling.behandlingId, true);
            }
        });
    };

    const opprettEllerFjern = () => {
        settSenderInn(true);
        if (kanFjerneVerge) {
            fjernVerge();
        } else {
            opprettVerge();
        }
    };

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanEndres || behandlingILesemodus}
            >
                {kanFjerneVerge ? 'Fjern verge/fullmektig' : 'Opprett verge/fullmektig'}
            </BehandlingsMenyButton>

            <UIModalWrapper
                modal={{
                    tittel: kanFjerneVerge
                        ? 'Fjern verge/fullmektig?'
                        : 'Opprett verge/fullmektig?',
                    visModal: visModal,
                    lukkKnapp: false,
                    actions: [
                        <FTButton
                            variant="tertiary"
                            key={'avbryt'}
                            onClick={() => {
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </FTButton>,
                        <FTButton
                            variant="primary"
                            key={'bekreft'}
                            disabled={senderInn}
                            spinner={senderInn}
                            onClick={() => opprettEllerFjern()}
                            size="small"
                        >
                            Ok
                        </FTButton>,
                    ],
                }}
                modelStyleProps={{
                    width: '20rem',
                    minHeight: '10rem',
                }}
            />
        </>
    );
};

export default OpprettFjernVerge;
