import type { FC, ReactNode } from 'react';

import { Button, Modal } from '@navikt/ds-react';

type Aksjonsknapp = {
    tekst: string;
    disabled?: boolean;
    loading?: boolean;
    onClick: () => void;
};

type Props = {
    tittel: string;
    visModal: boolean;
    aksjonsknapper: { hovedKnapp: Aksjonsknapp; lukkKnapp: Aksjonsknapp };
    children: ReactNode;
    onClose: () => void;
};

export const ModalWrapper: FC<Props> = ({
    tittel,
    visModal,
    onClose,
    aksjonsknapper,
    children,
}) => {
    return (
        visModal && (
            <Modal
                open={visModal}
                onClose={onClose}
                aria-label={tittel}
                header={{ heading: tittel, closeButton: !!onClose }}
                className="w-150"
            >
                <Modal.Body>{children}</Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={aksjonsknapper?.hovedKnapp.onClick}
                        disabled={aksjonsknapper?.hovedKnapp.disabled}
                        loading={aksjonsknapper?.hovedKnapp.loading}
                    >
                        {aksjonsknapper?.hovedKnapp.tekst}
                    </Button>
                    <Button
                        variant="tertiary"
                        onClick={aksjonsknapper?.lukkKnapp.onClick}
                        disabled={aksjonsknapper?.lukkKnapp.disabled}
                        loading={aksjonsknapper?.hovedKnapp.loading}
                    >
                        {aksjonsknapper?.lukkKnapp.tekst}
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    );
};
