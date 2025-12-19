import type { UttalelseMedFristFormData } from '../forhåndsvarselSchema';
import type { FieldErrors, SubmitHandler } from 'react-hook-form';

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
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { dateTilIsoDatoString } from '../../../../utils/dato';
import { HarUttaltSeg } from '../forhåndsvarselSchema';

type Props = {
    handleUttalelseSubmit: SubmitHandler<UttalelseMedFristFormData>;
    kanUtsetteFrist?: boolean;
};

type UttalelseJaErrors = FieldErrors<
    Extract<UttalelseMedFristFormData, { harUttaltSeg: HarUttaltSeg.Ja }>
>;
type UttalelseNeiErrors = FieldErrors<
    Extract<UttalelseMedFristFormData, { harUttaltSeg: HarUttaltSeg.Nei }>
>;
type UtsettFristErrors = FieldErrors<
    Extract<UttalelseMedFristFormData, { harUttaltSeg: HarUttaltSeg.UtsettFrist }>
>;

const isUttalelseJaErrors = (
    _errors: FieldErrors<UttalelseMedFristFormData>,
    harUttaltSeg: HarUttaltSeg | undefined
): _errors is UttalelseJaErrors => {
    return harUttaltSeg === HarUttaltSeg.Ja;
};

const isUttalelseNeiErrors = (
    _errors: FieldErrors<UttalelseMedFristFormData>,
    harUttaltSeg: HarUttaltSeg | undefined
): _errors is UttalelseNeiErrors => {
    return harUttaltSeg === HarUttaltSeg.Nei;
};

const isUtsettFristErrors = (
    _errors: FieldErrors<UttalelseMedFristFormData>,
    harUttaltSeg: HarUttaltSeg | undefined
): _errors is UtsettFristErrors => {
    return harUttaltSeg === HarUttaltSeg.UtsettFrist;
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
            {harUttaltSeg === HarUttaltSeg.Ja && isUttalelseJaErrors(errors, harUttaltSeg) && (
                <>
                    <Controller
                        name={`uttalelsesDetaljer.${0}.uttalelsesdato`}
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

                    <TextField
                        {...methods.register(`uttalelsesDetaljer.${0}.hvorBrukerenUttalteSeg`)}
                        label="Hvordan uttalte brukeren seg?"
                        description="For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss"
                        error={errors.uttalelsesDetaljer?.[0]?.hvorBrukerenUttalteSeg?.message}
                    />
                    <Textarea
                        {...methods.register(`uttalelsesDetaljer.${0}.uttalelseBeskrivelse`)}
                        label="Beskriv hva brukeren har uttalt seg om"
                        maxLength={4000}
                        resize
                        error={errors.uttalelsesDetaljer?.[0]?.uttalelseBeskrivelse?.message}
                    />
                </>
            )}

            {harUttaltSeg === HarUttaltSeg.Nei && isUttalelseNeiErrors(errors, harUttaltSeg) && (
                <Textarea
                    {...methods.register('kommentar')}
                    label="Kommentar til valget over"
                    maxLength={4000}
                    resize
                    error={errors.kommentar?.message}
                />
            )}
            {harUttaltSeg === HarUttaltSeg.UtsettFrist &&
                isUtsettFristErrors(errors, harUttaltSeg) && (
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
                            error={errors.utsettUttalelseFrist?.begrunnelse?.message}
                        />
                    </>
                )}
        </VStack>
    );
};
