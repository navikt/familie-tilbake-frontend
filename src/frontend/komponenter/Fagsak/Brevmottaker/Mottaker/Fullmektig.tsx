import type { BrevmottakerFormData } from '../schema/brevmottakerSchema';

import { Radio, RadioGroup, TextField, VStack } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { AdresseKilde, adresseKilder, MottakerType } from '../../../../typer/Brevmottaker';
import { ManuellRegistrering } from '../Adressekilde/ManuellRegistrering';

export const Fullmektig: React.FC = () => {
    const { register, watch, control, formState } = useFormContext<BrevmottakerFormData>();

    const adresseKilde = watch('fullmektig.adresseKilde');

    return (
        <VStack gap="space-32">
            <Controller
                name="fullmektig.adresseKilde"
                control={control}
                render={({ field, fieldState }) => (
                    <RadioGroup
                        legend="Adresse"
                        value={field.value || ''}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                    >
                        <Radio value={AdresseKilde.ManuellRegistrering}>
                            {adresseKilder[AdresseKilde.ManuellRegistrering]}
                        </Radio>
                        <Radio value={AdresseKilde.OppslagRegister}>
                            {adresseKilder[AdresseKilde.OppslagRegister]}
                        </Radio>
                        <Radio value={AdresseKilde.OppslagOrganisasjonsregister}>
                            {adresseKilder[AdresseKilde.OppslagOrganisasjonsregister]}
                        </Radio>
                    </RadioGroup>
                )}
            />

            {adresseKilde === AdresseKilde.ManuellRegistrering && (
                <ManuellRegistrering prefix="fullmektig" mottakerType={MottakerType.Fullmektig} />
            )}

            {adresseKilde === AdresseKilde.OppslagRegister && (
                <TextField
                    label="Fødselsnummer"
                    {...register('fullmektig.fødselsnummer')}
                    error={formState.errors?.fullmektig?.fødselsnummer?.message}
                />
            )}

            {adresseKilde === AdresseKilde.OppslagOrganisasjonsregister && (
                <VStack gap="space-16">
                    <TextField
                        label="Organisasjonsnummer"
                        {...register('fullmektig.organisasjonsnummer')}
                        error={formState.errors?.fullmektig?.organisasjonsnummer?.message}
                    />
                    <TextField
                        label="Kontaktperson i organisasjonen"
                        description='Navnet vises etter organisasjonsnavnet slik "Organisasjon AS v/ Navn Navnesen"'
                        {...register('fullmektig.navn')}
                        error={formState.errors?.fullmektig?.navn?.message}
                    />
                </VStack>
            )}
        </VStack>
    );
};
