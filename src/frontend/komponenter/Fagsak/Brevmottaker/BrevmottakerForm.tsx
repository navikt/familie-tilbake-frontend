import type { SubmitHandler } from 'react-hook-form';

import { Button, Fieldset, Select } from '@navikt/ds-react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { BrukerMedUtenlandskAdresse } from './BrukerMedUtenlandskAdresse';
import { Dødsbo } from './Dødsbo';
import { Fullmektig } from './Fullmektig';
import { Verge } from './Verge';
import { MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';

interface FormData {
    mottakerType: string;
    brukerMedUtenlandskAdresse?: {
        navn: string;
        land: string;
        adresselinje1: string;
        adresselinje2: string;
        postnummer: string;
        poststed: string;
    };
    fullmektig?: {
        adresseKilde: string;
        personnummer: string;
        organisasjonsnummer: string;
        navn: string;
        land: string;
        adresselinje1: string;
        adresselinje2: string;
        postnummer: string;
        poststed: string;
    };
    verge?: {
        vergetype: string;
        adresseKilde: string;
        personnummer: string;
        organisasjonsnummer: string;
        navn: string;
        land: string;
        adresselinje1: string;
        adresselinje2: string;
        postnummer: string;
        poststed: string;
    };
    dødsbo?: {
        navn: string;
        land: string;
        adresselinje1: string;
        adresselinje2: string;
        postnummer: string;
        poststed: string;
    };
}

interface BrevmottakerFormProps {
    initialData?: Partial<FormData>;
    onSubmit: (
        data: FormData,
        setError: (fieldName: string, error: { message: string }) => void
    ) => void;
    onCancel: () => void;
    submitButtonText: string;
}

export const BrevmottakerForm: React.FC<BrevmottakerFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    submitButtonText,
}) => {
    const methods = useForm<FormData>({
        reValidateMode: 'onBlur',
        shouldFocusError: false,
        defaultValues: {
            mottakerType: initialData?.mottakerType || '',
            brukerMedUtenlandskAdresse: {
                navn: '',
                land: '',
                adresselinje1: '',
                adresselinje2: '',
                postnummer: '',
                poststed: '',
                ...initialData?.brukerMedUtenlandskAdresse,
            },
            fullmektig: {
                adresseKilde: '',
                personnummer: '',
                organisasjonsnummer: '',
                navn: '',
                land: '',
                adresselinje1: '',
                adresselinje2: '',
                postnummer: '',
                poststed: '',
                ...initialData?.fullmektig,
            },
            verge: {
                vergetype: '',
                adresseKilde: '',
                personnummer: '',
                organisasjonsnummer: '',
                navn: '',
                land: '',
                adresselinje1: '',
                adresselinje2: '',
                postnummer: '',
                poststed: '',
                ...initialData?.verge,
            },
            dødsbo: {
                navn: '',
                land: '',
                adresselinje1: '',
                adresselinje2: '',
                postnummer: '',
                poststed: '',
                ...initialData?.dødsbo,
            },
        },
    });

    const { handleSubmit, setValue, watch, setError } = methods;
    const mottakerType = watch('mottakerType');

    const handleFormSubmit: SubmitHandler<FormData> = data => {
        const setErrorWrapper = (fieldName: string, error: { message: string }): void => {
            setError(fieldName as keyof FormData, error);
        };
        onSubmit(data, setErrorWrapper);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="flex">
                    <Fieldset
                        legend="Skjema for å legge til eller redigere brevmottaker"
                        hideLegend
                    >
                        <Select
                            label="Mottaker"
                            defaultValue={mottakerType}
                            onChange={(event): void => {
                                setValue('mottakerType', event.target.value as MottakerType);
                            }}
                        >
                            <option value="" disabled={true}>
                                Velg
                            </option>
                            {Object.values(MottakerType)
                                .filter(type => type !== MottakerType.Bruker)
                                .map(mottaker => (
                                    <option value={mottaker} key={mottaker}>
                                        {mottakerTypeVisningsnavn[mottaker]}
                                    </option>
                                ))}
                        </Select>
                        {mottakerType === MottakerType.BrukerMedUtenlandskAdresse && (
                            <BrukerMedUtenlandskAdresse />
                        )}
                        {mottakerType === MottakerType.Fullmektig && <Fullmektig />}
                        {mottakerType === MottakerType.Verge && <Verge />}
                        {mottakerType === MottakerType.Dødsbo && <Dødsbo />}
                    </Fieldset>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <Button type="submit">{submitButtonText}</Button>
                    <Button variant="tertiary" type="button" onClick={onCancel}>
                        Avbryt
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export type { FormData };
