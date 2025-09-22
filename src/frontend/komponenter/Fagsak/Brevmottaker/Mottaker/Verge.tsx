import type { AdresseRegistreringsData } from '../schema/brevmottakerSchema';

import { Radio, RadioGroup, TextField, VStack } from '@navikt/ds-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { AdresseKilde, MottakerType } from '../../../../typer/Brevmottaker';
import { ManuellRegistrering } from '../Adressekilde/ManuellRegistrering';

export const Verge: React.FC = () => {
    const { register, watch, setValue } = useFormContext<AdresseRegistreringsData>();

    const adresseKilde = watch('adresseKilde');

    const handleAdresseKildeChange = (
        nyAdresseKilde: Exclude<AdresseKilde, AdresseKilde.Udefinert>
    ): void => {
        setValue('adresseKilde', nyAdresseKilde);
    };

    return (
        <VStack gap="8">
            <RadioGroup
                legend="Verge"
                value={adresseKilde || ''}
                onChange={handleAdresseKildeChange}
            >
                <Radio value={AdresseKilde.ManuellRegistrering}>Manuell registrering</Radio>
                <Radio value={AdresseKilde.OppslagRegister}>Oppslag i personregister</Radio>
            </RadioGroup>

            {adresseKilde === AdresseKilde.ManuellRegistrering && (
                <ManuellRegistrering prefix="verge" mottakerType={MottakerType.Verge} />
            )}

            {adresseKilde === AdresseKilde.OppslagRegister && (
                <TextField label="Fødselsnummer" {...register('fødselsnummer')} />
            )}
        </VStack>
    );
};
