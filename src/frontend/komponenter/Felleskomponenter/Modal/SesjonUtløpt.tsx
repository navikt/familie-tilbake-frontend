import React from 'react';

import { BodyShort, Modal } from '@navikt/ds-react';

const UgyldigSesjon: React.FC = () => {
    return (
        <Modal
            open
            header={{ heading: 'Ugyldig sesjon', size: 'medium', closeButton: false }}
            portal={true}
            width="small"
        >
            <Modal.Body>
                <BodyShort>Prøv å last siden på nytt</BodyShort>
            </Modal.Body>
        </Modal>
    );
};

export default UgyldigSesjon;
