import { Radio, RadioGroup, TextField, VStack } from '@navikt/ds-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { AdresseKilde, adresseKilder, MottakerType } from '../../../../typer/Brevmottaker';
import { ManuellRegistrering } from '../Adressekilde/ManuellRegistrering';

export const Fullmektig: React.FC = () => {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();

    const adresseKilde = watch('fullmektig.adresseKilde');

    const handleAdresseKildeChange = (val: AdresseKilde): void => {
        setValue('fullmektig.adresseKilde', val);
    };

    const getErrorMessage = (path: string): string | undefined => {
        const errorObj = errors as Record<string, Record<string, { message?: string }>>;
        const pathParts = path.split('.');
        let current: Record<string, unknown> = errorObj;
        for (const part of pathParts) {
            current = current?.[part] as Record<string, unknown>;
        }
        return (current as { message?: string })?.message;
    };

    return (
        <VStack gap="8">
            <RadioGroup
                legend="Adresse"
                value={adresseKilde || ''}
                onChange={handleAdresseKildeChange}
                error={getErrorMessage('fullmektig.adresseKilde')}
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
                <TextField
                    label="Fødselsnummer"
                    {...register('fullmektig.personnummer')}
                    error={getErrorMessage('fullmektig.personnummer')}
                />
            )}

            {adresseKilde === AdresseKilde.OppslagOrganisasjonsregister && (
                <VStack gap="4">
                    <TextField
                        label="Organisasjonsnummer"
                        {...register('fullmektig.organisasjonsnummer')}
                        error={getErrorMessage('fullmektig.organisasjonsnummer')}
                    />
                    <TextField
                        label="Kontaktperson i organisasjonen"
                        description='Navnet vises etter organisasjonsnavnet slik "Organisasjon AS v/ Navn Navnesen"'
                        {...register('fullmektig.navn')}
                        error={getErrorMessage('fullmektig.navn')}
                    />
                </VStack>
            )}
        </VStack>
    );
};
