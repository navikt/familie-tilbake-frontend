import * as React from 'react';

import KnappBase, { Flatknapp, Knapp } from 'nav-frontend-knapper';
import { Normaltekst } from 'nav-frontend-typografi';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { IBehandling } from '../../../../../typer/behandling';
import { usePåVentBehandling } from '../../../../Felleskomponenter/Modal/PåVent/PåVentContext';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';

interface IProps {
    behandling: IBehandling;
}

const GjennoptaBehandling: React.FC<IProps> = ({ behandling }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);

    const { hentBehandlingMedBehandlingId } = useBehandling();
    const { feilmelding, onOkTaAvVent } = usePåVentBehandling((suksess: boolean) => {
        settVisModal(false);
        if (suksess) {
            hentBehandlingMedBehandlingId(behandling.behandlingId);
        }
    });

    return (
        <>
            <KnappBase mini={true} onClick={() => settVisModal(true)}>
                Fortsett behandlingen
            </KnappBase>

            <UIModalWrapper
                modal={{
                    tittel: 'Ta behandlingen av vent?',
                    visModal: visModal,
                    lukkKnapp: false,
                    actions: [
                        <Flatknapp
                            key={'avbryt'}
                            onClick={() => {
                                settVisModal(false);
                            }}
                        >
                            Avbryt
                        </Flatknapp>,
                        <Knapp
                            key={'bekreft'}
                            onClick={() => onOkTaAvVent(behandling.behandlingId)}
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
            >
                <>{feilmelding && feilmelding !== '' && <Normaltekst>{feilmelding}</Normaltekst>}</>
            </UIModalWrapper>
        </>
    );
};

export default GjennoptaBehandling;
