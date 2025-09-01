import { Alert, Modal, VStack } from '@navikt/ds-react';
import React from 'react';

import { BrevmottakerForm } from './BrevmottakerForm';
import { type FormData } from './types/FormData';
import { mapFormDataToBrevmottaker } from './utils/brevmottakerMapper';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBrevmottakerApi } from '../../../hooks/useBrevmottakerApi';
import { RessursStatus } from '../../../typer/ressurs';

interface EndreBrevmottakerModalProps {
    eksisterendeMottaker: Partial<FormData>;
    mottakerId?: string;
}

export const EndreBrevmottakerModal: React.FC<EndreBrevmottakerModalProps> = ({
    eksisterendeMottaker,
    mottakerId,
}) => {
    const { lukkBrevmottakerModal } = useBehandling();

    return (
        <Modal
            open={true}
            onClose={lukkBrevmottakerModal}
            header={{
                heading: 'Endre brevmottaker',
                size: 'medium',
            }}
        >
            <Modal.Body>
                <EndreBrevmottakerContent
                    eksisterendeMottaker={eksisterendeMottaker}
                    mottakerId={mottakerId}
                    onCancel={lukkBrevmottakerModal}
                />
            </Modal.Body>
        </Modal>
    );
};

const EndreBrevmottakerContent: React.FC<{
    eksisterendeMottaker: Partial<FormData>;
    mottakerId?: string;
    onCancel: () => void;
}> = ({ eksisterendeMottaker, mottakerId, onCancel }) => {
    const { behandling } = useBehandling();
    const { lagreBrevmottaker, error, clearError } = useBrevmottakerApi();

    const handleEndre = async (data: FormData): Promise<void> => {
        if (!behandling || behandling.status !== RessursStatus.Suksess) {
            return;
        }

        const brevmottaker = mapFormDataToBrevmottaker(data);
        const result = await lagreBrevmottaker(
            behandling.data.behandlingId,
            brevmottaker,
            mottakerId
        );

        if (result.success) {
            clearError();
            onCancel();
        }
    };

    if (!behandling || behandling.status !== RessursStatus.Suksess) {
        return null;
    }

    return (
        <VStack gap="4">
            {error && (
                <Alert variant="error" className="mb-4">
                    {error}
                </Alert>
            )}
            <BrevmottakerForm
                initialData={eksisterendeMottaker}
                onSubmit={handleEndre}
                onCancel={onCancel}
                submitButtonText="Lagre endringer"
            />
        </VStack>
    );
};
