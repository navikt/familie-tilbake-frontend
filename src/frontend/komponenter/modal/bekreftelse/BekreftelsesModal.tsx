import { BodyLong, Button, Modal } from '@navikt/ds-react';
import React from 'react';

import { MODAL_BREDDE } from '~/komponenter/meny/utils';

type Props = {
    åpen: boolean;
    onLukk: () => void;
    overskrift: string;
    brødtekst: string | undefined;
    bekreftTekst: string;
    onBekreft: () => void;
    laster?: boolean;
};

export const BekreftelsesModal: React.FC<Props> = ({
    åpen,
    onLukk,
    overskrift,
    brødtekst,
    bekreftTekst,
    onBekreft,
    laster = false,
}) => {
    return (
        <Modal
            open={åpen}
            onClose={onLukk}
            header={{ heading: overskrift }}
            className={MODAL_BREDDE}
        >
            <Modal.Body className="flex flex-col gap-2">
                {brødtekst && <BodyLong>{brødtekst}</BodyLong>}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onBekreft} loading={laster} disabled={laster}>
                    {bekreftTekst}
                </Button>
                <Button variant="secondary" onClick={onLukk}>
                    Avbryt
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
