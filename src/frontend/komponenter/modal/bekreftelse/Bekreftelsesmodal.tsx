import type { FC, RefObject } from 'react';

import { BodyLong, Button, Modal } from '@navikt/ds-react';
import { useCallback } from 'react';

import { MODAL_BREDDE } from '~/komponenter/meny/utils';

type BekreftelsesmodalTekster = {
    overskrift: string;
    brødtekst: string | undefined;
    bekreftTekst: string;
};

type PropsWithRef = {
    dialogRef: RefObject<HTMLDialogElement | null>;
    tekster: BekreftelsesmodalTekster;
    laster: boolean;
    onBekreft: () => void;
};

type PropsWithState = {
    open: boolean;
    onClose: () => void;
    tekster: BekreftelsesmodalTekster;
    laster: boolean;
    onBekreft: () => void;
};

export const Bekreftelsesmodal: FC<PropsWithRef> = ({ dialogRef, tekster, onBekreft, laster }) => {
    const { overskrift, brødtekst, bekreftTekst } = tekster;

    const handleLukk = useCallback(() => {
        dialogRef.current?.close();
    }, [dialogRef]);

    return (
        <Modal ref={dialogRef} header={{ heading: overskrift }} className={MODAL_BREDDE}>
            <Modal.Body>{brødtekst && <BodyLong>{brødtekst}</BodyLong>}</Modal.Body>
            <Modal.Footer>
                <Button onClick={onBekreft} loading={laster} disabled={laster}>
                    {bekreftTekst}
                </Button>
                <Button variant="secondary" onClick={handleLukk}>
                    Avbryt
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export const BekreftelsesmodalMedState: FC<PropsWithState> = ({
    open,
    onClose,
    tekster,
    onBekreft,
    laster,
}) => {
    const { overskrift, brødtekst, bekreftTekst } = tekster;

    return (
        <Modal
            open={open}
            onClose={onClose}
            header={{ heading: overskrift }}
            className={MODAL_BREDDE}
        >
            <Modal.Body>{brødtekst && <BodyLong>{brødtekst}</BodyLong>}</Modal.Body>
            <Modal.Footer>
                <Button onClick={onBekreft} loading={laster} disabled={laster}>
                    {bekreftTekst}
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Avbryt
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
