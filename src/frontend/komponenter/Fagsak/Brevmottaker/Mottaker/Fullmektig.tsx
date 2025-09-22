import type { AdresseRegistreringsData } from '../schema/brevmottakerSchema';

import { Radio, RadioGroup, TextField, VStack } from '@navikt/ds-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { AdresseKilde, adresseKilder, MottakerType } from '../../../../typer/Brevmottaker';
import { ManuellRegistrering } from '../Adressekilde/ManuellRegistrering';

export const Fullmektig: React.FC = () => {
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
                legend="Adresse"
                value={adresseKilde || ''}
                onChange={handleAdresseKildeChange}
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

            {adresseKilde === AdresseKilde.ManuellRegistrering && (
                <ManuellRegistrering prefix="fullmektig" mottakerType={MottakerType.Fullmektig} />
            )}

            {adresseKilde === AdresseKilde.OppslagRegister && (
                <TextField label="Fødselsnummer" {...register('personnummer')} />
            )}

            {adresseKilde === AdresseKilde.OppslagOrganisasjonsregister && (
                <VStack gap="4">
                    <TextField label="Organisasjonsnummer" {...register('organisasjonsnummer')} />
                    <TextField
                        label="Kontaktperson i organisasjonen"
                        description='Navnet vises etter organisasjonsnavnet slik "Organisasjon AS v/ Navn Navnesen"'
                        {...register('navn')}
                    />
                </VStack>
            )}
        </VStack>
    );
};
