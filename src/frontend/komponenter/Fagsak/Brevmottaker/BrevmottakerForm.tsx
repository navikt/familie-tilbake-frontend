import type { SubmitHandler } from 'react-hook-form';

import { Button, Fieldset, Select } from '@navikt/ds-react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { BrukerMedUtenlandskAdresse } from './BrukerMedUtenlandskAdresse';
import { Dødsbo } from './Dødsbo';
import { Fullmektig } from './Fullmektig';
import { type BrevmottakerFormData } from './schema/brevmottakerSchema';
import { createFormDefaults } from './schema/brevmottakerSchema';
import { Verge } from './Verge';
import { MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';

interface BrevmottakerFormProps {
    readonly initialData?: Partial<BrevmottakerFormData>;
    onSubmit: (
        data: BrevmottakerFormData,
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
    const methods = useForm<BrevmottakerFormData>({
        reValidateMode: 'onBlur',
        shouldFocusError: false,
        defaultValues: createFormDefaults(initialData),
    });

    const { handleSubmit, setValue, watch, setError } = methods;
    const mottakerType = watch('mottakerType');

    const handleFormSubmit: SubmitHandler<BrevmottakerFormData> = data => {
        const setErrorWrapper = (fieldName: string, error: { message: string }): void => {
            setError(fieldName as keyof BrevmottakerFormData, error);
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
                <div>
                    <Button type="submit">{submitButtonText}</Button>
                    <Button variant="tertiary" type="button" onClick={onCancel}>
                        Avbryt
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};
