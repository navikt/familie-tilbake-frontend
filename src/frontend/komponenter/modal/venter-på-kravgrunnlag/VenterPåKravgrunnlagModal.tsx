import type { FC } from 'react';

import { BodyLong, Button, Modal } from '@navikt/ds-react';
import { useRef } from 'react';

import { hentVentebeskrivelse, VENTER_PÅ_KRAVGRUNNLAG_TITTEL } from '@/utils/venterPåKravgrunnlag';

export const VenterPåKravgrunnlagModal: FC = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const beskrivelse = hentVentebeskrivelse();

    return (
        <Modal
            ref={dialogRef}
            open
            onClose={undefined}
            header={{
                heading: VENTER_PÅ_KRAVGRUNNLAG_TITTEL,
                closeButton: false,
            }}
            portal
            width="medium"
        >
            <Modal.Body>
                <BodyLong>{beskrivelse}</BodyLong>
            </Modal.Body>
            <Modal.Footer>
                <Button size="small" onClick={(): void => dialogRef.current?.close()}>
                    Lukk
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
