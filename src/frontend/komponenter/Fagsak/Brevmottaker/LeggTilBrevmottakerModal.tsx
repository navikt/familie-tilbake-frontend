import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, VStack, Button, Fieldset, Select } from '@navikt/ds-react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { BrukerMedUtenlandskAdresse } from './BrukerMedUtenlandskAdresse';
import { Dødsbo } from './Dødsbo';
import { Fullmektig } from './Fullmektig';
import {
    brevmottakerFormDataInputSchema,
    brevmottakerFormDataSchema,
    type BrevmottakerFormData,
    createFormDefaults,
} from './schema/brevmottakerSchema';
import { Verge } from './Verge';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBrevmottakerApi } from '../../../hooks/useBrevmottakerApi';
import { MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { RessursStatus } from '../../../typer/ressurs';

interface LeggTilBrevmottakerModalProps {
    open?: boolean;
    onClose?: () => void;
}

export const LeggTilBrevmottakerModal: React.FC<LeggTilBrevmottakerModalProps> = ({
    open,
    onClose,
}) => {
    const { lukkBrevmottakerModal, visBrevmottakerModal, behandling } = useBehandling();
    const { lagreBrevmottaker, clearError } = useBrevmottakerApi();

    const isOpen = open ?? visBrevmottakerModal;

    const methods = useForm<BrevmottakerFormData>({
        resolver: zodResolver(brevmottakerFormDataInputSchema),
        mode: 'onBlur',
        defaultValues: createFormDefaults(),
    });

    const { handleSubmit, setValue, watch, setError, formState } = methods;
    const mottakerType = watch('mottakerType');

    // Debug form state
    console.log('Form state:', formState);
    console.log('Form errors:', formState.errors);
    console.log('Form isValid:', formState.isValid);

    const handleCancel = (): void => {
        if (onClose) {
            onClose();
        } else {
            lukkBrevmottakerModal();
        }
    };

    const handleLeggTil: SubmitHandler<BrevmottakerFormData> = async data => {
        console.log('handleLeggTil called with data:', data);

        if (!behandling || behandling.status !== RessursStatus.Suksess) {
            console.log('No behandling or wrong status');
            return;
        }

        // Use the schema transform to convert form data to IBrevmottaker
        console.log('Parsing data with schema...');
        const brevmottaker = brevmottakerFormDataSchema.parse(data);
        console.log('Parsed brevmottaker:', brevmottaker);

        const result = await lagreBrevmottaker(behandling.data.behandlingId, brevmottaker);

        if (result.success) {
            clearError();
            handleCancel();
        } else if (result.error) {
            if (data.mottakerType === MottakerType.Fullmektig) {
                if (data.fullmektig?.organisasjonsnummer) {
                    setError('fullmektig.organisasjonsnummer', { message: result.error });
                } else if (data.fullmektig?.personnummer) {
                    setError('fullmektig.personnummer', { message: result.error });
                }
            } else if (data.mottakerType === MottakerType.Verge) {
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
        <FormProvider {...methods}>
            <Modal
                open={isOpen}
                onClose={handleCancel}
                header={{ heading: 'Legg til brevmottaker' }}
                width="medium"
            >
                <form
                    onSubmit={e => {
                        console.log('Form submit triggered!', e);
                        handleSubmit(handleLeggTil)(e);
                    }}
                >
                    {/*  Må ha en min høyde for at select dropdown ikke skal overlappe */}
                    <Modal.Body style={{ minHeight: '700px' }}>
                        <VStack gap="4">
                            <Fieldset legend="Skjema for å legge til brevmottaker" hideLegend>
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
                                        <option value="" disabled={true}>
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
                        <Button type="submit" onClick={() => console.log('Submit button clicked!')}>
                            Legg til
                        </Button>
                        <Button variant="secondary" type="button" onClick={handleCancel}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </FormProvider>
    );
};

export default LeggTilBrevmottakerModal;
