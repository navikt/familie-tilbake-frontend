import React from 'react';

import { BodyShort, Button, Modal } from '@navikt/ds-react';

interface Props {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const SettBehandlingTilbakeTilFaktaModal: React.FC<Props> = ({ isOpen, onConfirm, onCancel }) => {
    return (
        <>
            {isOpen && (
                <Modal
                    open
                    portal={true}
                    onClose={onCancel}
                    header={{ heading: 'Sett behandling tilbake til fakta' }}
                >
                    <Modal.Body>
                        <BodyShort>
                            Er du sikker på at du vil sette behandlingen tilbake til fakta ?
                        </BodyShort>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="button" onClick={onConfirm}>
                            Fortsett
                        </Button>
                        <Button type="button" variant="secondary" onClick={onCancel}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default SettBehandlingTilbakeTilFaktaModal;
