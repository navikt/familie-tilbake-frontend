import type { FC } from 'react';
import type { VenterDto } from '@/generated';

import { BodyLong, Button, Modal } from '@navikt/ds-react';
import { useRef } from 'react';

import { hentVentebeskrivelse, VENTER_PÅ_KRAVGRUNNLAG_TITTEL } from '@/utils/venterPåKravgrunnlag';

type Props = {
    venter: VenterDto;
};

export const VenterPåKravgrunnlagModal: FC<Props> = ({ venter }: Props) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const beskrivelse = hentVentebeskrivelse(venter.grunn);

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
            {beskrivelse && (
                <Modal.Body>
                    <BodyLong>{beskrivelse}</BodyLong>
                </Modal.Body>
            )}
            <Modal.Footer>
                <Button size="small" onClick={(): void => dialogRef.current?.close()}>
                    Lukk
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
