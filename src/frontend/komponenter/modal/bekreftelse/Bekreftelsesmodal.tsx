import type { FC, RefObject } from 'react';

import { BodyLong, Button, Modal } from '@navikt/ds-react';

import { MODAL_BREDDE } from '~/komponenter/meny/utils';

type BekreftelsesmodalTekster = {
    overskrift: string;
    brødtekst: string | undefined;
    bekreftTekst: string;
};

type Props = {
    dialogRef: RefObject<HTMLDialogElement | null>;
    tekster: BekreftelsesmodalTekster;
    laster: boolean;
    onBekreft: () => void;
};

export const Bekreftelsesmodal: FC<Props> = ({ dialogRef, tekster, onBekreft, laster }) => {
    const { overskrift, brødtekst, bekreftTekst } = tekster;
    return (
        <Modal ref={dialogRef} header={{ heading: overskrift }} className={MODAL_BREDDE}>
            <Modal.Body>{brødtekst && <BodyLong>{brødtekst}</BodyLong>}</Modal.Body>
            <Modal.Footer>
                <Button onClick={onBekreft} loading={laster} disabled={laster}>
                    {bekreftTekst}
                </Button>
                <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
                    Avbryt
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
