import { Radio, RadioGroup, TextField, VStack } from '@navikt/ds-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import ManuellRegistrering from './ManuellRegistrering';
import { AdresseKilde, MottakerType } from '../../../typer/Brevmottaker';

export const Verge: React.FC = () => {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();

    const adresseKilde = watch('verge.adresseKilde');

    const handleAdresseKildeChange = (val: AdresseKilde): void => {
        setValue('verge.adresseKilde', val);
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
                legend="Verge"
                value={adresseKilde || ''}
                onChange={handleAdresseKildeChange}
                error={getErrorMessage('verge.adresseKilde')}
            >
                <Radio value={AdresseKilde.ManuellRegistrering}>Manuell registrering</Radio>
                <Radio value={AdresseKilde.OppslagRegister}>Oppslag i personregister</Radio>
            </RadioGroup>

            {adresseKilde === AdresseKilde.ManuellRegistrering && (
                <ManuellRegistrering prefix="verge" mottakerType={MottakerType.Verge} />
            )}

            {adresseKilde === AdresseKilde.OppslagRegister && (
                <TextField
                    label="Fødselsnummer"
                    {...register('verge.personnummer')}
                    error={getErrorMessage('verge.personnummer')}
                />
            )}
        </VStack>
    );
};
