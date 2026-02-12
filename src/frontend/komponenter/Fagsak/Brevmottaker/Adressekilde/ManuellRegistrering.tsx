import type { Land } from '../../../Felleskomponenter/Landvelger/Landvelger';

import { Alert, Fieldset, HStack, TextField, VStack } from '@navikt/ds-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useFormContext, get } from 'react-hook-form';

import { MottakerType } from '../../../../typer/Brevmottaker';
import { Landvelger } from '../../../Felleskomponenter/Landvelger/Landvelger';

type Props = {
    preutfyltNavn?: string;
    mottakerType: MottakerType;
    prefix: string;
};

export const ManuellRegistrering: React.FC<Props> = ({ preutfyltNavn, mottakerType, prefix }) => {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();

    const fieldPath = useCallback((field: string): string => `${prefix}.${field}`, [prefix]);

    const landValue = watch(fieldPath('land'));

    const eksluderLandKoder = useMemo(() => {
        if (mottakerType === MottakerType.BrukerMedUtenlandskAdresse) {
            return ['NO'];
        }
        return undefined;
    }, [mottakerType]);

    const håndterLandValgt = useCallback(
        ({ alpha2 }: Land) => {
            setValue(fieldPath('land'), alpha2);
        },
        [setValue, fieldPath]
    );

    useEffect(() => {
        if (preutfyltNavn) {
            setValue(fieldPath('navn'), preutfyltNavn);
        }
    }, [preutfyltNavn, setValue, fieldPath]);

    const getFieldError = useCallback(
        (key: string) => get(errors, fieldPath(key))?.message,
        [errors, fieldPath]
    );

    return (
        <Fieldset legend="Manuell adresseregistrering" hideLegend>
            <VStack gap="space-16">
                <TextField
                    {...register(fieldPath('navn'))}
                    label="Navn"
                    readOnly={!!preutfyltNavn}
                    error={getFieldError('navn')}
                />
                <Landvelger
                    id={`landvelger-${prefix}`}
                    eksluderLandkoder={eksluderLandKoder}
                    valgtLandkode={landValue}
                    håndterLandValgt={håndterLandValgt}
                    error={getFieldError('land')}
                />
                {landValue && (
                    <>
                        <TextField
                            {...register(fieldPath('adresselinje1'))}
                            label="Adresselinje 1"
                            error={getFieldError('adresselinje1')}
                        />
                        <TextField
                            {...register(fieldPath('adresselinje2'))}
                            label="Adresselinje 2 (valgfri)"
                            error={getFieldError('adresselinje2')}
                        />
                        {landValue !== 'NO' && (
                            <Alert variant="info">
                                Ved utenlandsk adresse skal postnummer og poststed legges i
                                adresselinjene.
                            </Alert>
                        )}
                        {landValue === 'NO' && (
                            <HStack gap="space-16" wrap>
                                <TextField
                                    {...register(fieldPath('postnummer'))}
                                    label="Postnummer"
                                    error={getFieldError('postnummer')}
                                    className="flex-1"
                                />
                                <TextField
                                    {...register(fieldPath('poststed'))}
                                    label="Poststed"
                                    error={getFieldError('poststed')}
                                    className="flex-2"
                                />
                            </HStack>
                        )}
                    </>
                )}
            </VStack>
        </Fieldset>
    );
};
