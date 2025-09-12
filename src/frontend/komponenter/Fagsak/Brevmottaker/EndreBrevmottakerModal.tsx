import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, VStack, Button, Fieldset, Select } from '@navikt/ds-react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { BrukerMedUtenlandskAdresse } from './BrukerMedUtenlandskAdresse';
import { Dødsbo } from './Dødsbo';
import { Fullmektig } from './Fullmektig';
import brevmottakerFormDataSchema, {
    type BrevmottakerFormData,
} from './schema/brevmottakerFormData';
import { mapFormDataToBrevmottaker } from './utils/brevmottakerMapper';
import { opprettStandardSkjemaverdier } from './utils/formDefaults';
import { Verge } from './Verge';
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
        resolver: zodResolver(brevmottakerFormDataSchema),
        reValidateMode: 'onBlur',
        defaultValues: opprettStandardSkjemaverdier(eksisterendeMottaker),
    });

    const { handleSubmit, watch, setError, setValue } = methods;
    const mottakerType = watch('mottakerType');

    const handleEndre: SubmitHandler<BrevmottakerFormData> = async data => {
        if (!behandling || behandling.status !== RessursStatus.Suksess || !mottakerId) {
            return;
        }

        const brevmottaker = mapFormDataToBrevmottaker(data);
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
                <form onSubmit={handleSubmit(handleEndre)}>
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
                        <Button type="submit">Lagre endringer</Button>
                        <Button variant="secondary" type="button" onClick={handleCancel}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </FormProvider>
    );
}
