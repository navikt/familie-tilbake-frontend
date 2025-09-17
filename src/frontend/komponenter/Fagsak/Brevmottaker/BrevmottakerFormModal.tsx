import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, VStack, Button, Fieldset, Select } from '@navikt/ds-react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { BrukerMedUtenlandskAdresse } from './Mottaker/BrukerMedUtenlandskAdresse';
import { Dødsbo } from './Mottaker/Dødsbo';
import { Fullmektig } from './Mottaker/Fullmektig';
import { Verge } from './Mottaker/Verge';
import {
    brevmottakerFormDataInputSchema,
    brevmottakerFormDataSchema,
    type BrevmottakerFormData,
} from './schema/brevmottakerSchema';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBrevmottakerApi } from '../../../hooks/useBrevmottakerApi';
import { AdresseKilde, MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { RessursStatus } from '../../../typer/ressurs';

type BrevmottakerFormModalProps = {
    mode: 'endre' | 'leggTil';
    initialData?: Partial<BrevmottakerFormData>;
    mottakerId?: string;
    open?: boolean;
    onClose?: () => void;
};

export const BrevmottakerFormModal: React.FC<BrevmottakerFormModalProps> = ({
    mode,
    initialData,
    mottakerId,
    open,
    onClose,
}) => {
    const { lukkBrevmottakerModal, visBrevmottakerModal, behandling } = useBehandling();
    const { lagreBrevmottaker } = useBrevmottakerApi();

    const isOpen = open ?? visBrevmottakerModal;

    const closeModal = (): void => {
        if (onClose) {
            onClose();
        } else {
            lukkBrevmottakerModal();
        }
    };

    const methods = useForm<BrevmottakerFormData>({
        reValidateMode: 'onBlur',
        shouldFocusError: false,
        defaultValues: initialData,
        resolver: zodResolver(brevmottakerFormDataInputSchema),
    });

    const { handleSubmit, setValue, watch, setError } = methods;
    const mottakerType = watch('mottakerType');

    const handleSubmitForm = async (formData: BrevmottakerFormData): Promise<void> => {
        if (!behandling || behandling.status !== RessursStatus.Suksess) {
            return;
        }

        try {
            const brevmottaker = brevmottakerFormDataSchema.parse(formData);

            const response = await lagreBrevmottaker(
                behandling.data.behandlingId,
                brevmottaker,
                mottakerId
            );

            if (response.success) {
                closeModal();
                return;
            }

            const errorMessage = response.error || 'En ukjent feil oppstod';
            handleBrevmottakerError(formData, errorMessage);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const firstError = error.issues[0];
                if (firstError) {
                    handleBrevmottakerError(formData, firstError.message);
                }
            }
        }
    };

    const handleBrevmottakerError = (data: BrevmottakerFormData, errorMessage: string): void => {
        if (data.mottakerType === MottakerType.Fullmektig) {
            if (data.fullmektig?.adresseKilde === AdresseKilde.OppslagOrganisasjonsregister) {
                setError('fullmektig.organisasjonsnummer', { message: errorMessage });
            } else if (data.fullmektig?.adresseKilde === AdresseKilde.OppslagRegister) {
                setError('fullmektig.personnummer', { message: errorMessage });
            }
        } else if (data.mottakerType === MottakerType.Verge) {
            if (data.verge?.adresseKilde === AdresseKilde.OppslagOrganisasjonsregister) {
                setError('verge.organisasjonsnummer', { message: errorMessage });
            } else if (data.verge?.adresseKilde === AdresseKilde.OppslagRegister) {
                setError('verge.personnummer', { message: errorMessage });
            }
        }
    };

    if (!behandling || behandling.status !== RessursStatus.Suksess) {
        return null;
    }

    const modalConfig = {
        leggTil: {
            heading: 'Legg til brevmottaker',
            submitText: 'Legg til',
            legend: 'Skjema for å legge til brevmottaker',
        },
        endre: {
            heading: 'Endre brevmottaker',
            submitText: 'Lagre endringer',
            legend: 'Skjema for å endre brevmottaker',
        },
    };

    const config = modalConfig[mode];

    return (
        <FormProvider {...methods}>
            <Modal
                open={isOpen}
                onClose={closeModal}
                header={{ heading: config.heading }}
                width="medium"
            >
                <form
                    onSubmit={e => {
                        handleSubmit(handleSubmitForm)(e);
                    }}
                >
                    {/* Må ha en min høyde for at select dropdown ikke skal overlappe */}
                    <Modal.Body style={{ minHeight: '700px' }}>
                        <VStack gap="4">
                            <Fieldset legend={config.legend} hideLegend>
                                <VStack gap="8">
                                    <Select
                                        label="Mottaker"
                                        defaultValue={mottakerType}
                                        onChange={(event): void => {
                                            setValue(
                                                'mottakerType',
                                                event.target.value as MottakerType
                                            );
                                        }}
                                    >
                                        <option value="" disabled>
                                            Velg
                                        </option>
                                        {Object.values(MottakerType)
                                            .filter(type => type !== MottakerType.Bruker)
                                            .map(mottaker => (
                                                <option value={mottaker} key={mottaker}>
                                                    {mottakerTypeVisningsnavn[mottaker]}
                                                </option>
                                            ))}
                                    </Select>
                                    {mottakerType === MottakerType.BrukerMedUtenlandskAdresse && (
                                        <BrukerMedUtenlandskAdresse />
                                    )}
                                    {mottakerType === MottakerType.Fullmektig && <Fullmektig />}
                                    {mottakerType === MottakerType.Verge && <Verge />}
                                    {mottakerType === MottakerType.Dødsbo && <Dødsbo />}
                                </VStack>
                            </Fieldset>
                        </VStack>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit">{config.submitText}</Button>
                        <Button variant="secondary" type="button" onClick={closeModal}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </FormProvider>
    );
};
