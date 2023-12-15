import * as React from 'react';

import { ErrorMessage, Modal, BodyShort } from '@navikt/ds-react';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { IBehandling } from '../../../../../typer/behandling';
import { BehandlingsMenyButton, FTButton } from '../../../../Felleskomponenter/Flytelementer';
import { usePåVentBehandling } from '../../../../Felleskomponenter/Modal/PåVent/PåVentContext';

interface IProps {
    behandling: IBehandling;
    onListElementClick: () => void;
}

const GjennoptaBehandling: React.FC<IProps> = ({ behandling, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);

    const { hentBehandlingMedBehandlingId } = useBehandling();
    const { feilmelding, onOkTaAvVent, nullstillSkjema } = usePåVentBehandling(
        (suksess: boolean) => {
            settVisModal(false);
            if (suksess) {
                hentBehandlingMedBehandlingId(behandling.behandlingId);
            }
        }
    );

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanEndres}
            >
                Fortsett behandlingen
            </BehandlingsMenyButton>

            {visModal && (
                <Modal
                    open
                    header={{ heading: 'Ta behandlingen av vent?', size: 'medium' }}
                    portal={true}
                    width="small"
                    onClose={() => {
                        nullstillSkjema();
                        settVisModal(false);
                    }}
                >
                    <Modal.Body>
                        <BodyShort>Ønsker du å fortsette behandlingen?</BodyShort>
                        {feilmelding && feilmelding !== '' && (
                            <div className="skjemaelement__feilmelding">
                                <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <FTButton
                            variant="primary"
                            key={'bekreft'}
                            onClick={() => onOkTaAvVent(behandling.behandlingId)}
                            size="small"
                        >
                            Ok
                        </FTButton>
                        <FTButton
                            variant="tertiary"
                            key={'avbryt'}
                            onClick={() => {
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </FTButton>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default GjennoptaBehandling;
