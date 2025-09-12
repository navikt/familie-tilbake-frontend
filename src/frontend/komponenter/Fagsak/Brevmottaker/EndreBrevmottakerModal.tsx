import type { FormData } from './types/FormData';
import type { SubmitHandler } from 'react-hook-form';

import { Alert, Modal, VStack, Button, Fieldset, Select } from '@navikt/ds-react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { BrukerMedUtenlandskAdresse } from './BrukerMedUtenlandskAdresse';
import { Dødsbo } from './Dødsbo';
import { Fullmektig } from './Fullmektig';
import { mapFormDataToBrevmottaker } from './utils/brevmottakerMapper';
import { opprettStandardSkjemaverdier } from './utils/formDefaults';
import { Verge } from './Verge';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBrevmottakerApi } from '../../../hooks/useBrevmottakerApi';
import { MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { RessursStatus } from '../../../typer/ressurs';

interface EndreBrevmottakerModalProps {
    eksisterendeMottaker: Partial<FormData>;
    mottakerId?: string;
}

export const EndreBrevmottakerModal: React.FC<EndreBrevmottakerModalProps> = ({
    eksisterendeMottaker,
    mottakerId,
}) => {
    const { lukkBrevmottakerModal, behandling } = useBehandling();
    const { lagreBrevmottaker, error, clearError } = useBrevmottakerApi();

    const methods = useForm<FormData>({
        reValidateMode: 'onBlur',
        shouldFocusError: false,
        defaultValues: opprettStandardSkjemaverdier(eksisterendeMottaker),
    });

    const { handleSubmit, setValue, watch } = methods;
    const mottakerType = watch('mottakerType');

    const handleEndre: SubmitHandler<FormData> = async data => {
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
            lukkBrevmottakerModal();
        }
    };

    if (!behandling || behandling.status !== RessursStatus.Suksess) {
        return null;
    }

    return (
        <FormProvider {...methods}>
            <Modal
                open={true}
                width="small"
                onClose={lukkBrevmottakerModal}
                header={{
                    heading: 'Endre brevmottaker',
                }}
            >
                <form onSubmit={handleSubmit(handleEndre)}>
                    {/*  Må ha en min høyde for at select dropdown ikke skal overlappe */}
                    <Modal.Body style={{ minHeight: '700px' }}>
                        <VStack gap="4">
                            {error && (
                                <Alert variant="error" className="mb-4">
                                    {error}
                                </Alert>
                            )}
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
                        <Button variant="secondary" type="button" onClick={lukkBrevmottakerModal}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </FormProvider>
    );
};
