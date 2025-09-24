import { Radio, RadioGroup, TextField, VStack } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { AdresseKilde, MottakerType } from '../../../../typer/Brevmottaker';
import { ManuellRegistrering } from '../Adressekilde/ManuellRegistrering';

export const Verge: React.FC = () => {
    const { register, watch, control } = useFormContext();

    const adresseKilde = watch('verge.adresseKilde');

    return (
        <VStack gap="8">
            <Controller
                name="verge.adresseKilde"
                control={control}
                render={({ field, fieldState }) => (
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
                <TextField label="Fødselsnummer" {...register('verge.fødselsnummer')} />
            )}
        </VStack>
    );
};
