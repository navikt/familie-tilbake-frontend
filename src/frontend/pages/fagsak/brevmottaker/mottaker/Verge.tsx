import type { FC, JSX } from 'react';
import type { BrevmottakerFormData } from '@/pages/fagsak/brevmottaker/schema/schema';

import { Radio, RadioGroup, TextField, VStack } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';

import { ManuellRegistrering } from '@/pages/fagsak/brevmottaker/adressekilde/ManuellRegistrering';
import { AdresseKilde, MottakerType } from '@/typer/Brevmottaker';

export const Verge: FC = () => {
    const { register, watch, control, formState } = useFormContext<BrevmottakerFormData>();

    const adresseKilde = watch('verge.adresseKilde');

    return (
        <VStack gap="space-32">
            <Controller
                name="verge.adresseKilde"
                control={control}
                // biome-ignore lint/suspicious/noExplicitAny: Vet ikke hva addresseKilde-typen er i runtime, og det er mye overhead å type denne eksplisitt. --- IGNORE ---
                render={({ field, fieldState }: { field: any; fieldState: any }): JSX.Element => (
                    <RadioGroup
                        legend="Adresse"
                        value={field.value || ''}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                    >
                        <Radio value={AdresseKilde.ManuellRegistrering}>Manuell registrering</Radio>
                        <Radio value={AdresseKilde.OppslagRegister}>Oppslag i personregister</Radio>
                    </RadioGroup>
                )}
            />

            {adresseKilde === AdresseKilde.ManuellRegistrering && (
                <ManuellRegistrering prefix="verge" mottakerType={MottakerType.Verge} />
            )}

            {adresseKilde === AdresseKilde.OppslagRegister && (
                <TextField
                    label="Fødselsnummer"
                    {...register('verge.fødselsnummer')}
                    error={formState.errors?.verge?.fødselsnummer?.message}
                />
            )}
        </VStack>
    );
};
