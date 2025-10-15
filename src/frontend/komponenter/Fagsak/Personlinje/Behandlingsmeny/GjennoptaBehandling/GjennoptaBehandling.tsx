import type { Behandling } from '../../../../../typer/behandling';

import { Button, ErrorMessage, Modal } from '@navikt/ds-react';
import * as React from 'react';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';
import { usePåVentBehandling } from '../../../../Felleskomponenter/Modal/PåVent/PåVentContext';

type Props = {
    behandling: Behandling;
};

export const GjennoptaBehandling: React.FC<Props> = ({ behandling }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { hentBehandlingMedBehandlingId } = useBehandling();

    const lukkModalOgHentBehandling = (): void => {
        settVisModal(false);
        hentBehandlingMedBehandlingId(behandling.behandlingId);
    };

    const { feilmelding, onOkTaAvVent } = usePåVentBehandling(lukkModalOgHentBehandling);

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => settVisModal(true)}
                disabled={!behandling.kanEndres}
            >
                Fortsett behandlingen
            </BehandlingsMenyButton>

            {visModal && (
                <Modal
                    open
                    header={{ heading: 'Ta behandlingen av vent?', size: 'medium' }}
                    portal
                    width="small"
                    onClose={() => settVisModal(false)}
                >
                    <Modal.Body>
                        {feilmelding && feilmelding !== '' && (
                            <div className="skjemaelement__feilmelding">
                                <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            key="bekreft"
                            onClick={() => onOkTaAvVent(behandling.behandlingId)}
                            size="small"
                        >
                            Ok
                        </Button>
                        <Button
                            variant="tertiary"
                            key="avbryt"
                            onClick={() => settVisModal(false)}
                            size="small"
                        >
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};
