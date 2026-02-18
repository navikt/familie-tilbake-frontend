import { FeilModal } from '@komponenter/modal/feil/FeilModal';
import { ArrowCirclepathReverseIcon } from '@navikt/aksel-icons';
import { ActionMenu, BodyLong, Button, Modal } from '@navikt/ds-react';
import { MODAL_BREDDE } from '../utils';
import * as React from 'react';

import { useStartPåNytt } from './useStartPåNytt';

export const StartPåNytt: React.FC = () => {
    const { mutate, isError, error, reset, dialogRef, åpneDialog, isPending } = useStartPåNytt();

    return (
        <>
            <ActionMenu.Item
                onSelect={åpneDialog}
                icon={<ArrowCirclepathReverseIcon aria-hidden />}
                className="text-xl cursor-pointer"
            >
                <span className="ml-1">Start på nytt</span>
            </ActionMenu.Item>

            <Modal
                ref={dialogRef}
                header={{
                    heading: 'Start behandlingen på nytt',
                }}
                className={MODAL_BREDDE}
            >
                <Modal.Body>
                    <BodyLong>
                        Dersom du starter på nytt, vil alt arbeid som er gjort i denne behandlingen
                        bli slettet. Denne handlingen kan ikke angres.
                    </BodyLong>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => mutate()} loading={isPending}>
                        Start på nytt
                    </Button>
                    <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>

            {isError && <FeilModal feil={error} lukkFeilModal={reset} />}
        </>
    );
};
