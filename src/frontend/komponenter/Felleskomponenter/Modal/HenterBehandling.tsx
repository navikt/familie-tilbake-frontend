import * as React from 'react';

import { BodyShort, HStack, Loader, Modal } from '@navikt/ds-react';

const HenterBehandling: React.FC = () => {
    return (
        <Modal
            open
            header={{ heading: 'Henter behandling', size: 'medium', closeButton: false }}
            portal={true}
            width="small"
        >
            <Modal.Body>
                <HStack justify="space-between">
                    <div>
                        <BodyShort>Henting av behandlingen tar litt tid.</BodyShort>
                        <BodyShort>Vennligst vent!</BodyShort>
                    </div>
                    <Loader size="large" title="venter..." transparent={false} variant="neutral" />
                </HStack>
            </Modal.Body>
        </Modal>
    );
};

export default HenterBehandling;
