import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, VStack, Button, Fieldset, Select } from '@navikt/ds-react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

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
import { MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { RessursStatus } from '../../../typer/ressurs';

interface EndreBrevmottakerModalProps {
    readonly eksisterendeMottaker: Partial<BrevmottakerFormData>;
    readonly mottakerId?: string;
}

export function EndreBrevmottakerModal({
    eksisterendeMottaker,
    mottakerId,
}: EndreBrevmottakerModalProps): React.JSX.Element | null {
    const { behandling, lukkBrevmottakerModal } = useBehandling();
    const { lagreBrevmottaker } = useBrevmottakerApi();

    const methods = useForm<BrevmottakerFormData>({
        resolver: zodResolver(brevmottakerFormDataInputSchema),
        mode: 'onBlur',
        defaultValues: eksisterendeMottaker,
    });

    const { handleSubmit, watch, setError, setValue, formState } = methods;
    const mottakerType = watch('mottakerType');

    // Debug form state
    console.log('EndreBrevmottaker - Form state:', formState);
    console.log('EndreBrevmottaker - Form errors:', formState.errors);
    console.log('EndreBrevmottaker - Form errors fullmektig:', formState.errors.fullmektig);
    console.log('EndreBrevmottaker - Form isValid:', formState.isValid);
    console.log('EndreBrevmottaker - mottakerType:', mottakerType);
    console.log('EndreBrevmottaker - eksisterendeMottaker:', eksisterendeMottaker);

    const handleEndre: SubmitHandler<BrevmottakerFormData> = async data => {
        console.log('handleEndre called with data:', data);

        if (!behandling || behandling.status !== RessursStatus.Suksess || !mottakerId) {
            console.log('No behandling, wrong status, or no mottakerId');
            return;
        }

        // Use the schema transform to convert form data to IBrevmottaker
        console.log('Parsing data with schema...');
        const brevmottaker = brevmottakerFormDataSchema.parse(data);
        console.log('Parsed brevmottaker:', brevmottaker);

        const response = await lagreBrevmottaker(
            behandling.data.behandlingId,
            brevmottaker,
            mottakerId
        );

        if (response.success) {
            lukkBrevmottakerModal();
            return;
        }

        const errorMessage = response.error || 'En ukjent feil oppstod';

        if (data.mottakerType === MottakerType.Fullmektig) {
            if (data.fullmektig?.organisasjonsnummer) {
                setError('fullmektig.organisasjonsnummer', { message: errorMessage });
            } else if (data.fullmektig?.personnummer) {
                setError('fullmektig.personnummer', { message: errorMessage });
            }
        } else if (data.mottakerType === MottakerType.Verge) {
            if (data.verge?.organisasjonsnummer) {
                setError('verge.organisasjonsnummer', { message: errorMessage });
            } else if (data.verge?.personnummer) {
                setError('verge.personnummer', { message: errorMessage });
            }
        }
    };

    const handleCancel = (): void => {
        lukkBrevmottakerModal();
    };

    if (!behandling || behandling.status !== RessursStatus.Suksess) {
        return null;
    }

    return (
        <FormProvider {...methods}>
            <Modal
                open={!!mottakerId}
                onClose={handleCancel}
                header={{ heading: 'Endre brevmottaker' }}
                width="medium"
            >
                <form
                    onSubmit={e => {
                        console.log('EndreBrevmottaker - Form submit triggered!', e);
                        handleSubmit(handleEndre)(e);
                    }}
                >
                    {/* Må ha en min høyde for at select dropdown ikke skal overlappe */}
                    <Modal.Body style={{ minHeight: '700px' }}>
                        <VStack gap="4">
                            <Fieldset legend="Skjema for å endre brevmottaker" hideLegend>
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
                        <Button
                            type="submit"
                            onClick={() =>
                                console.log('EndreBrevmottaker - Submit button clicked!')
                            }
                        >
                            Lagre endringer
                        </Button>
                        <Button variant="secondary" type="button" onClick={handleCancel}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </FormProvider>
    );
}
