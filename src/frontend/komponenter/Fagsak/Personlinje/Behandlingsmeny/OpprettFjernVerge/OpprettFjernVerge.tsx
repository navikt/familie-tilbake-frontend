import * as React from 'react';

import KnappBase, { Flatknapp, Knapp } from 'nav-frontend-knapper';

import { useHttp } from '@navikt/familie-http';
import { Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { Behandlingssteg, IBehandling } from '../../../../../typer/behandling';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';

interface IProps {
    behandling: IBehandling;
    onListElementClick: () => void;
}

const OpprettFjernVerge: React.FC<IProps> = ({ behandling, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const [senderInn, settSenderInn] = React.useState<boolean>(false);
    const { hentBehandlingMedBehandlingId, aktivtSteg } = useBehandling();
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
            <KnappBase
                mini={true}
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
            >
                {kanFjerneVerge ? 'Fjern verge/fullmektig' : 'Opprett verge/fullmektig'}
            </KnappBase>

            <UIModalWrapper
                modal={{
                    tittel: kanFjerneVerge
                        ? 'Fjern verge/fullmektig?'
                        : 'Opprett verge/fullmektig?',
                    visModal: visModal,
                    lukkKnapp: false,
                    actions: [
                        <Flatknapp
                            key={'avbryt'}
                            onClick={() => {
                                settVisModal(false);
                            }}
                            mini={true}
                        >
                            Avbryt
                        </Flatknapp>,
                        <Knapp
                            type={'hoved'}
                            key={'bekreft'}
                            disabled={senderInn}
                            spinner={senderInn}
                            onClick={() => opprettEllerFjern()}
                            mini={true}
                        >
                            Ok
                        </Knapp>,
                    ],
                }}
                style={{
                    content: {
                        width: '20rem',
                        minHeight: '10rem',
                    },
                }}
            ></UIModalWrapper>
        </>
    );
};

export default OpprettFjernVerge;
