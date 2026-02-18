import type { Brevmottaker } from '@typer/Brevmottaker';

import { zodResolver } from '@hookform/resolvers/zod';
import { useBrevmottakerApi } from '@hooks/useBrevmottakerApi';
import { Modal, VStack, Button, Fieldset, Select } from '@navikt/ds-react';
import { AdresseKilde, MottakerType, mottakerTypeVisningsnavn } from '@typer/Brevmottaker';
import * as React from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { BrukerMedUtenlandskAdresse } from './mottaker/BrukerMedUtenlandskAdresse';
import { Dødsbo } from './mottaker/Dødsbo';
import { Fullmektig } from './mottaker/Fullmektig';
import { Verge } from './mottaker/Verge';
import {
    brevmottakerFormDataInputSchema,
    brevmottakerFormDataSchema,
    type BrevmottakerFormData,
} from './schema/schema';

type BrevmottakerFormModalProps = {
    mode: 'endre' | 'leggTil';
    initialData?: Partial<BrevmottakerFormData>;
    mottakerId?: string;
    visBrevmottakerModal: boolean;
    settVisBrevmottakerModal: (vis: boolean) => void;
    settBrevmottakerIdTilEndring: (id: string | undefined) => void;
};

export const BrevmottakerFormModal: React.FC<BrevmottakerFormModalProps> = ({
    mode,
    initialData,
    mottakerId,
    visBrevmottakerModal,
    settVisBrevmottakerModal,
    settBrevmottakerIdTilEndring,
}: BrevmottakerFormModalProps) => {
    const { lagreBrevmottaker } = useBrevmottakerApi();

    const lukkModal = (): void => {
        settVisBrevmottakerModal(false);
        settBrevmottakerIdTilEndring(undefined);
    };

    const methods = useForm<BrevmottakerFormData>({
        reValidateMode: 'onChange',
        shouldFocusError: false,
        defaultValues: initialData,
        resolver: zodResolver(brevmottakerFormDataInputSchema),
    });

    const { handleSubmit, setError, register, formState } = methods;
    const mottakerType = useWatch({ control: methods.control, name: 'mottakerType' });

    const handleSubmitForm = async (formData: BrevmottakerFormData): Promise<void> => {
        try {
            const brevmottaker = brevmottakerFormDataSchema.parse(formData) as Brevmottaker;
            const response = await lagreBrevmottaker(brevmottaker, mottakerId);

            if (response.success) {
                lukkModal();
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
                setError('fullmektig.fødselsnummer', { message: errorMessage });
            }
        } else if (data.mottakerType === MottakerType.Verge) {
            if (data.verge?.adresseKilde === AdresseKilde.OppslagRegister) {
                setError('verge.fødselsnummer', { message: errorMessage });
            }
        }
    };

    const modalTekster = {
        leggTil: {
            tittel: 'Legg til brevmottaker',
            sendInnTekst: 'Legg til',
            beskrivelse: 'Skjema for å legge til brevmottaker',
        },
        endre: {
            tittel: 'Endre brevmottaker',
            sendInnTekst: 'Lagre endringer',
            beskrivelse: 'Skjema for å endre brevmottaker',
        },
    } as const;

    const tekster = modalTekster[mode];

    return (
        <FormProvider {...methods}>
            <Modal
                open={visBrevmottakerModal}
                onClose={lukkModal}
                header={{ heading: tekster.tittel }}
                width="medium"
            >
                <form onSubmit={handleSubmit(handleSubmitForm)}>
                    {/* Må ha en min høyde for at select dropdown ikke skal overlappe */}
                    <Modal.Body style={{ minHeight: '500px' }}>
                        <VStack gap="space-16">
                            <Fieldset legend={tekster.beskrivelse} hideLegend>
                                <VStack gap="space-32">
                                    <Select
                                        {...register('mottakerType')}
                                        label="Mottaker"
                                        defaultValue=""
                                        error={formState.errors.mottakerType?.message}
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
                        <Button type="submit">{tekster.sendInnTekst}</Button>
                        <Button variant="secondary" onClick={lukkModal}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </FormProvider>
    );
};
