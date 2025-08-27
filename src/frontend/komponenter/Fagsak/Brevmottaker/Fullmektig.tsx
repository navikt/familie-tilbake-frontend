import { Radio, RadioGroup, TextField } from '@navikt/ds-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import ManuellRegistrering from './ManuellRegistrering';
import { AdresseKilde, adresseKilder, MottakerType } from '../../../typer/Brevmottaker';
import { validateOrganisasjonsnummer, validatePersonnummer } from '../../../utils/validation';

export const Fullmektig: React.FC = () => {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();

    const adresseKilde = watch('fullmektig.adresseKilde');

    const nullstillManuellAdresseInput = (nullstillAdresseKilde = false): void => {
        setValue('fullmektig.personnummer', '');
        setValue('fullmektig.organisasjonsnummer', '');
        setValue('fullmektig.navn', '');

        if (nullstillAdresseKilde) {
            setValue('fullmektig.adresseKilde', '');
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
                legend="Adresse"
                value={adresseKilde || ''}
                onChange={(val: AdresseKilde) => {
                    setValue('fullmektig.adresseKilde', val);
                    nullstillManuellAdresseInput(false);
                }}
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
                    {...register('fullmektig.personnummer', {
                        required: 'Fødselsnummer er påkrevd',
                        validate: validatePersonnummer,
                    })}
                    error={getErrorMessage('fullmektig.personnummer')}
                />
            )}

            {adresseKilde === AdresseKilde.OppslagOrganisasjonsregister && (
                <>
                    <TextField
                        label="Organisasjonsnummer"
                        {...register('fullmektig.organisasjonsnummer', {
                            required: 'Organisasjonsnummer er påkrevd',
                            validate: validateOrganisasjonsnummer,
                        })}
                        error={getErrorMessage('fullmektig.organisasjonsnummer')}
                    />
                    <TextField
                        label="Kontaktperson i organisasjonen"
                        description='Valgfritt. Navnet vises etter organisasjonsnavnet slik "Organisasjon AS v/ Navn Navnesen"'
                        {...register('fullmektig.navn')}
                        error={getErrorMessage('fullmektig.navn')}
                    />
                </>
            )}
        </>
    );
};
