import type { FormData } from './BrevmottakerForm';

import { Modal, VStack } from '@navikt/ds-react';
import React from 'react';

import { BrevmottakerForm } from './BrevmottakerForm';
import { mapFormDataToBrevmottaker } from './utils/brevmottakerMapper';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBrevmottakerApi } from '../../../hooks/useBrevmottakerApi';
import { RessursStatus } from '../../../typer/ressurs';

interface LeggTilBrevmottakerModalProps {
    open?: boolean;
    onClose?: () => void;
}

export const LeggTilBrevmottakerModal: React.FC<LeggTilBrevmottakerModalProps> = ({
    open,
    onClose,
}) => {
    const { settVisBrevmottakerModal, visBrevmottakerModal } = useBehandling();

    // Hvis open ikke er oppgitt, bruk visBrevmottakerModal fra context
    const isOpen = open ?? visBrevmottakerModal;

    const lukkModal = (): void => {
        settVisBrevmottakerModal(false);
    };

    const handleCancel = (): void => {
        if (onClose) {
            onClose();
        } else {
            lukkModal();
        }
    };

    return (
        <Modal
            open={isOpen}
            onClose={handleCancel}
            header={{ heading: 'Legg til brevmottaker' }}
            width="medium"
        >
            <Modal.Body>
                <LeggTilBrevmottakerContent onCancel={handleCancel} />
            </Modal.Body>
        </Modal>
    );
};

const LeggTilBrevmottakerContent: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const { behandling } = useBehandling();
    const { lagreBrevmottaker, clearError } = useBrevmottakerApi();

    const handleLeggTil = async (
        data: FormData,
        setError: (fieldName: string, error: { message: string }) => void
    ): Promise<void> => {
        if (!behandling || behandling.status !== RessursStatus.Suksess) {
            return;
        }

        const brevmottaker = mapFormDataToBrevmottaker(data);
        const result = await lagreBrevmottaker(behandling.data.behandlingId, brevmottaker);

        if (result.success) {
            clearError();
            onCancel();
        } else if (result.error) {
            // Sett feilmelding på riktig felt basert på mottakertype og adresseKilde
            if (data.mottakerType === 'FULLMEKTIG') {
                if (data.fullmektig?.organisasjonsnummer) {
                    setError('fullmektig.organisasjonsnummer', { message: result.error });
                } else if (data.fullmektig?.personnummer) {
                    setError('fullmektig.personnummer', { message: result.error });
                }
            } else if (data.mottakerType === 'VERGE') {
                if (data.verge?.organisasjonsnummer) {
                    setError('verge.organisasjonsnummer', { message: result.error });
                } else if (data.verge?.personnummer) {
                    setError('verge.personnummer', { message: result.error });
                }
            }
        }
    };

    if (!behandling || behandling.status !== RessursStatus.Suksess) {
        return null;
    }

    return (
        <VStack gap="4">
            <BrevmottakerForm
                onSubmit={handleLeggTil}
                onCancel={onCancel}
                submitButtonText="Legg til"
            />
        </VStack>
    );
};

export default LeggTilBrevmottakerModal;
