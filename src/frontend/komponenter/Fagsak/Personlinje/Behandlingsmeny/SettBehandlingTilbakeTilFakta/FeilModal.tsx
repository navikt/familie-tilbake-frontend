import { XMarkOctagonFillIcon } from '@navikt/aksel-icons';
import { Button, List, Modal, VStack } from '@navikt/ds-react';
import React from 'react';

interface Props {
    setVisFeilModal: (setVisFeilModal: boolean) => void;
    behandlingId?: string;
    erSynlig?: boolean;
    fagsakId?: string;
    feilmelding?: string;
    httpStatusCode?: number;
}

export const FeilModal = ({
    setVisFeilModal,
    behandlingId,
    erSynlig,
    fagsakId,
    feilmelding,
    httpStatusCode = 500,
}: Props) => {
    const headerTittel = httpStatusCode === 403 ? 'Ingen tilgang' : 'Feil';
    const contentTittel =
        httpStatusCode === 403
            ? 'Du har ikke tilgang til å utføre denne handlingen'
            : 'Det oppstod en feil ved behandling av forespørselen';
    return (
        <Modal
            open={erSynlig}
            onClose={() => setVisFeilModal(false)}
            header={{
                icon: <XMarkOctagonFillIcon aria-hidden color="var(--a-icon-danger)" />,
                heading: headerTittel,
                closeButton: false,
            }}
            className="bg-red-300"
            portal
        >
            <Modal.Body className="flex flex-col gap-6">
                <p style={{ color: 'var(--a-text-subtle)' }}>{httpStatusCode} Forbidden</p>

                <VStack gap="4">
                    <VStack gap="4">
                        <h2 className="font-semibold text-xl">{contentTittel}</h2>
                        <p>
                            {feilmelding ||
                                'Dette er ikke din feil, det er en feil vi ikke greide å håndtere.'}
                        </p>
                        <VStack>
                            <h3 className="font-semibold text-base">Hva kan du gjøre?</h3>
                            <List as="ul">
                                <List.Item>
                                    Om du mener at du <i>burde</i> ha tilgang, ta kontakt med
                                    nærmeste leder eller Nav IT identhåndtering.
                                </List.Item>
                                <List.Item>Meld feil i porten.</List.Item>
                            </List>
                        </VStack>
                    </VStack>
                    {(fagsakId || behandlingId) && (
                        <VStack gap="1" style={{ color: 'var(--a-text-subtle)' }}>
                            {fagsakId && <span>Fagsak id: {fagsakId}</span>}
                            {behandlingId && <span>Behandlings id: {behandlingId}</span>}
                        </VStack>
                    )}
                </VStack>
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" onClick={() => setVisFeilModal(false)}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
