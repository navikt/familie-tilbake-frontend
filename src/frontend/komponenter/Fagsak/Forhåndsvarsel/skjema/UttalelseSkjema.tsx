import type { UttalelseMedFristFormData } from '../forhåndsvarselSchema';
import type { SubmitHandler } from 'react-hook-form';

import {
    VStack,
    RadioGroup,
    Radio,
    DatePicker,
    TextField,
    Textarea,
    useDatepicker,
} from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import React from 'react';
import { Controller, get, useFormContext, useWatch } from 'react-hook-form';

import { dateTilIsoDatoString } from '../../../../utils/dato';
import { HarUttaltSeg } from '../forhåndsvarselSchema';

type Props = {
    handleUttalelseSubmit: SubmitHandler<UttalelseMedFristFormData>;
    kanUtsetteFrist?: boolean;
};

export const Uttalelse: React.FC<Props> = ({ handleUttalelseSubmit, kanUtsetteFrist = false }) => {
    const methods = useFormContext<UttalelseMedFristFormData>();

    const harUttaltSeg = useWatch({
        control: methods.control,
        name: 'harUttaltSeg',
    });

    const errors = methods.formState.errors;

    const uttalelsesDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('uttalelsesDetaljer.0.uttalelsesdato', dateString);
            methods.trigger('uttalelsesDetaljer.0.uttalelsesdato');
        },
    });

    const nyFristDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('utsettUttalelseFrist.nyFrist', dateString);
            methods.trigger('utsettUttalelseFrist.nyFrist');
        },
    });

    return (
        <VStack
            as="form"
            maxWidth={ATextWidthMax}
            gap="4"
            onSubmit={methods.handleSubmit(handleUttalelseSubmit)}
            id="uttalelseForm"
        >
            <Controller
                control={methods.control}
                name="harUttaltSeg"
                render={({ field, fieldState }) => (
                    <RadioGroup
                        {...field}
                        size="small"
                        legend="Har brukeren uttalt seg etter forhåndsvarselet?"
                        error={fieldState.error?.message}
                    >
                        <Radio value={HarUttaltSeg.Ja}>Ja</Radio>
                        <Radio value={HarUttaltSeg.Nei}>Nei</Radio>
                        {kanUtsetteFrist && (
                            <Radio value={HarUttaltSeg.UtsettFrist}>
                                Utsett frist for å uttale seg
                            </Radio>
                        )}
                    </RadioGroup>
                )}
            />
            {harUttaltSeg === HarUttaltSeg.Ja && (
                <>
                    <Controller
                        name="uttalelsesDetaljer.0.uttalelsesdato"
                        control={methods.control}
                        render={({ field, fieldState }) => (
                            <DatePicker {...uttalelsesDatepicker.datepickerProps}>
                                <DatePicker.Input
                                    {...field}
                                    {...uttalelsesDatepicker.inputProps}
                                    label="Når uttalte brukeren seg?"
                                    error={fieldState.error?.message}
                                />
                            </DatePicker>
                        )}
                    />
                    <Controller
                        name="uttalelsesDetaljer.0.hvorBrukerenUttalteSeg"
                        control={methods.control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Hvordan uttalte brukeren seg?"
                                description="For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss"
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="uttalelsesDetaljer.0.uttalelseBeskrivelse"
                        control={methods.control}
                        render={({ field, fieldState }) => (
                            <Textarea
                                {...field}
                                label="Beskriv hva brukeren har uttalt seg om"
                                maxLength={4000}
                                resize
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                </>
            )}

            {harUttaltSeg === HarUttaltSeg.Nei && (
                <Textarea
                    {...methods.register('kommentar')}
                    label="Kommentar til valget over"
                    maxLength={4000}
                    resize
                    error={get(errors, 'kommentar.message')}
                />
            )}
            {harUttaltSeg === HarUttaltSeg.UtsettFrist && (
                <>
                    <Controller
                        name="utsettUttalelseFrist.nyFrist"
                        control={methods.control}
                        render={({ field, fieldState }) => (
                            <DatePicker {...nyFristDatepicker.datepickerProps}>
                                <DatePicker.Input
                                    {...nyFristDatepicker.inputProps}
                                    label="Sett ny dato for frist"
                                    name={field.name}
                                    error={fieldState.error?.message}
                                />
                            </DatePicker>
                        )}
                    />
                    <Textarea
                        {...methods.register('utsettUttalelseFrist.begrunnelse')}
                        label="Begrunnelse for utsatt frist"
                        maxLength={4000}
                        resize
                        error={get(errors, 'utsettUttalelseFrist.begrunnelse.message')}
                    />
                </>
            )}
        </VStack>
    );
};
