import { Radio, RadioGroup, TextField } from '@navikt/ds-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import ManuellRegistrering from './ManuellRegistrering';
import { AdresseKilde, MottakerType } from '../../../typer/Brevmottaker';
import { validatePersonnummer } from '../../../utils/validation';

export const Verge: React.FC = () => {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();

    const adresseKilde = watch('verge.adresseKilde');

    const nullstillManuellAdresseInput = (nullstillAdresseKilde = false): void => {
        setValue('verge.personnummer', '');

        if (nullstillAdresseKilde) {
            setValue('verge.adresseKilde', '');
        }
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
        <>
            <RadioGroup
                legend="Verge"
                value={adresseKilde || ''}
                onChange={(val: AdresseKilde) => {
                    setValue('verge.adresseKilde', val);
                    nullstillManuellAdresseInput(false);
                }}
                error={getErrorMessage('verge.adresseKilde')}
            >
                <Radio value={AdresseKilde.ManuellRegistrering}>Manuell registrering</Radio>
                <Radio value={AdresseKilde.OppslagRegister}>Oppslag i personregister</Radio>
            </RadioGroup>

            {adresseKilde === AdresseKilde.ManuellRegistrering && (
                <ManuellRegistrering prefix="verge" mottakerType={MottakerType.Verge} />
            )}

            {adresseKilde === AdresseKilde.OppslagRegister && (
                <div>
                    <TextField
                        label="Fødselsnummer"
                        {...register('verge.personnummer', {
                            required: 'Fødselsnummer er påkrevd',
                            validate: validatePersonnummer,
                        })}
                        error={getErrorMessage('verge.personnummer')}
                    />
                </div>
            )}
        </>
    );
};
